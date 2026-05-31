import { icon } from '../../core/icons';

// =============================================================================
// Types
// =============================================================================

interface EntityNode {
  id: string;
  name: string;
  x: number;
  y: number;
}

interface AttrNode {
  id: string;
  name: string;
  parentId: string;
  x: number;
  y: number;
  isKey: boolean;
}

interface RelConn {
  entityId: string;
  cardinality: string;
  totalParticipation: boolean;
}

interface RelNode {
  id: string;
  name: string;
  x: number;
  y: number;
  connections: RelConn[];
}

interface ERState {
  entities: EntityNode[];
  attributes: AttrNode[];
  relationships: RelNode[];
  selectedId: string | null;
  zoom: number;
  panX: number;
  panY: number;
}

// =============================================================================
// Constants
// =============================================================================

const ENT_W = 160, ENT_H = 50;
const ATTR_RX = 56, ATTR_RY = 24;
const REL_HW = 58, REL_HH = 30;
const DEBOUNCE_MS = 400;

let _nextId = 1;
function genId(p: string): string { return `${p}_${++_nextId}`; }

// =============================================================================
// Shape geometry
// =============================================================================

function edgeRect(cx: number, cy: number, w: number, h: number, tx: number, ty: number) {
  const dx = tx - cx, dy = ty - cy;
  if (Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001) return { x: cx, y: cy };
  const hw = w / 2, hh = h / 2;
  const t = Math.min(
    dx !== 0 ? hw / Math.abs(dx) : Infinity,
    dy !== 0 ? hh / Math.abs(dy) : Infinity,
  );
  return { x: cx + dx * t, y: cy + dy * t };
}

function edgeEllipse(cx: number, cy: number, rx: number, ry: number, tx: number, ty: number) {
  const dx = tx - cx, dy = ty - cy;
  if (Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001) return { x: cx, y: cy };
  const t = 1 / Math.sqrt((dx * dx) / (rx * rx) + (dy * dy) / (ry * ry));
  return { x: cx + dx * t, y: cy + dy * t };
}

function edgeDiamond(cx: number, cy: number, hw: number, hh: number, tx: number, ty: number) {
  const dx = tx - cx, dy = ty - cy;
  if (Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001) return { x: cx, y: cy };
  const verts = [
    { x: cx, y: cy - hh }, { x: cx + hw, y: cy },
    { x: cx, y: cy + hh }, { x: cx - hw, y: cy },
  ];
  let bestT = Infinity, bestPt = { x: cx, y: cy };
  for (let i = 0; i < 4; i++) {
    const a = verts[i], b = verts[(i + 1) % 4];
    const ex = b.x - a.x, ey = b.y - a.y;
    const det = dx * ey - dy * ex;
    if (Math.abs(det) < 0.0001) continue;
    const t1 = (ex * (a.y - cy) - ey * (a.x - cx)) / det;
    const t2 = -(dx * (cy - a.y) - dy * (cx - a.x)) / det;
    if (t1 > 0.001 && t2 >= -0.001 && t2 <= 1.001 && t1 < bestT) {
      bestT = t1;
      bestPt = { x: cx + dx * t1, y: cy + dy * t1 };
    }
  }
  return bestPt;
}

// =============================================================================
// Theme colors
// =============================================================================

function getColors() {
  const dark = document.documentElement.classList.contains('dark');
  return {
    entityFill: dark ? '#3b4878' : '#dce6f8',
    entityStroke: dark ? '#5a6aaa' : '#8a9cc8',
    entityText: dark ? '#dde0f0' : '#1e2844',
    attrFill: dark ? '#3a583a' : '#e0f0e0',
    attrStroke: dark ? '#5a885a' : '#90c090',
    attrText: dark ? '#c8e0c8' : '#224422',
    relFill: dark ? '#6a4a2a' : '#fce8d0',
    relStroke: dark ? '#9a7a4a' : '#d8b878',
    relText: dark ? '#f8e8d0' : '#4a3020',
    line: dark ? '#7a7a9a' : '#8a8aa0',
    selStroke: '#e67e22',
    cardBg: dark ? '#2a2a40' : '#ffffff',
    cardText: dark ? '#c0c0d8' : '#444466',
    canvasBg: dark ? '#1a1a2e' : '#fafbfd',
  };
}

// =============================================================================
// SVG Renderer
// =============================================================================

function renderDiagram(container: HTMLElement, state: ERState): void {
  const cs = getColors();
  const svgNS = 'http://www.w3.org/2000/svg';

  let svg = container.querySelector('#er-diagram-svg') as SVGSVGElement | null;
  if (!svg) {
    // Remove any icon SVGs from empty hint
    const stray = container.querySelectorAll('svg');
    stray.forEach(s => s.remove());
    svg = document.createElementNS(svgNS, 'svg') as SVGSVGElement;
    svg.id = 'er-diagram-svg';
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.style.display = 'block';
    container.appendChild(svg);
  }
  svg.innerHTML = '';

  const defs = document.createElementNS(svgNS, 'defs');
  defs.innerHTML = `
    <filter id="er-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="1" dy="2" stdDeviation="2" flood-opacity="0.25"/>
    </filter>
  `;
  svg.appendChild(defs);

  const mainG = document.createElementNS(svgNS, 'g');
  mainG.setAttribute('transform', `translate(${state.panX},${state.panY}) scale(${state.zoom})`);
  svg.appendChild(mainG);

  const eMap = new Map(state.entities.map(e => [e.id, e]));
  const rMap = new Map(state.relationships.map(r => [r.id, r]));

  function lineEl(x1: number, y1: number, x2: number, y2: number) {
    const l = document.createElementNS(svgNS, 'line');
    l.setAttribute('x1', String(x1)); l.setAttribute('y1', String(y1));
    l.setAttribute('x2', String(x2)); l.setAttribute('y2', String(y2));
    l.setAttribute('stroke', cs.line); l.setAttribute('stroke-width', '1.5');
    return l;
  }

  // ---- Entity-to-attribute lines ----
  for (const a of state.attributes) {
    const parentE = eMap.get(a.parentId);
    if (parentE) {
      const p1 = edgeRect(parentE.x, parentE.y, ENT_W, ENT_H, a.x, a.y);
      const p2 = edgeEllipse(a.x, a.y, ATTR_RX, ATTR_RY, parentE.x, parentE.y);
      mainG.appendChild(lineEl(p1.x, p1.y, p2.x, p2.y));
      continue;
    }
    const parentR = rMap.get(a.parentId);
    if (parentR) {
      const p1 = edgeDiamond(parentR.x, parentR.y, REL_HW, REL_HH, a.x, a.y);
      const p2 = edgeEllipse(a.x, a.y, ATTR_RX, ATTR_RY, parentR.x, parentR.y);
      mainG.appendChild(lineEl(p1.x, p1.y, p2.x, p2.y));
    }
  }

  // ---- Relationship-to-entity lines with cardinality ----
  for (const r of state.relationships) {
    for (const conn of r.connections) {
      const e = eMap.get(conn.entityId);
      if (!e) continue;
      const p1 = edgeDiamond(r.x, r.y, REL_HW, REL_HH, e.x, e.y);
      const p2 = edgeRect(e.x, e.y, ENT_W, ENT_H, r.x, r.y);

      const dx = p2.x - p1.x, dy = p2.y - p1.y;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;

      mainG.appendChild(lineEl(p1.x, p1.y, p2.x, p2.y));

      // Cardinality label (near entity end, offset perpendicular)
      const t = 0.65;
      const lx = p1.x + dx * t, ly = p1.y + dy * t;
      const ox = -dy / len * 14, oy = dx / len * 14;

      const bg = document.createElementNS(svgNS, 'rect');
      bg.setAttribute('x', String(lx + ox - 14)); bg.setAttribute('y', String(ly + oy - 10));
      bg.setAttribute('width', '28'); bg.setAttribute('height', '20');
      bg.setAttribute('rx', '4'); bg.setAttribute('fill', cs.cardBg);
      bg.setAttribute('stroke', cs.line); bg.setAttribute('stroke-width', '0.5');
      bg.setAttribute('opacity', '0.9');
      mainG.appendChild(bg);

      const lbl = document.createElementNS(svgNS, 'text');
      lbl.setAttribute('x', String(lx + ox)); lbl.setAttribute('y', String(ly + oy + 4));
      lbl.setAttribute('text-anchor', 'middle'); lbl.setAttribute('font-size', '13');
      lbl.setAttribute('font-weight', '700');
      lbl.setAttribute('font-family', 'var(--font-mono, monospace)');
      lbl.setAttribute('fill', cs.selStroke);
      lbl.textContent = conn.cardinality;
      mainG.appendChild(lbl);
    }
  }

  // ---- Entities (rectangles) ----
  for (const e of state.entities) {
    const g = document.createElementNS(svgNS, 'g');
    g.setAttribute('class', 'er-node'); g.setAttribute('data-id', e.id);
    g.setAttribute('data-kind', 'entity'); g.style.cursor = 'grab';
    const sel = state.selectedId === e.id;

    const rect = document.createElementNS(svgNS, 'rect');
    rect.setAttribute('x', String(e.x - ENT_W / 2)); rect.setAttribute('y', String(e.y - ENT_H / 2));
    rect.setAttribute('width', String(ENT_W)); rect.setAttribute('height', String(ENT_H));
    rect.setAttribute('rx', '6'); rect.setAttribute('fill', cs.entityFill);
    rect.setAttribute('stroke', sel ? cs.selStroke : cs.entityStroke);
    rect.setAttribute('stroke-width', sel ? '2.5' : '1.5');
    rect.setAttribute('filter', 'url(#er-shadow)');
    g.appendChild(rect);

    const txt = document.createElementNS(svgNS, 'text');
    txt.setAttribute('x', String(e.x)); txt.setAttribute('y', String(e.y + 5));
    txt.setAttribute('text-anchor', 'middle'); txt.setAttribute('dominant-baseline', 'central');
    txt.setAttribute('font-size', '14'); txt.setAttribute('font-weight', '600');
    txt.setAttribute('font-family', 'var(--font-sans, system-ui, sans-serif)');
    txt.setAttribute('fill', cs.entityText);
    txt.textContent = trunc(e.name, 14);
    g.appendChild(txt);
    mainG.appendChild(g);
  }

  // ---- Attributes (ellipses) ----
  for (const a of state.attributes) {
    const g = document.createElementNS(svgNS, 'g');
    g.setAttribute('class', 'er-node'); g.setAttribute('data-id', a.id);
    g.setAttribute('data-kind', 'attribute'); g.style.cursor = 'grab';
    const sel = state.selectedId === a.id;

    const ell = document.createElementNS(svgNS, 'ellipse');
    ell.setAttribute('cx', String(a.x)); ell.setAttribute('cy', String(a.y));
    ell.setAttribute('rx', String(ATTR_RX)); ell.setAttribute('ry', String(ATTR_RY));
    ell.setAttribute('fill', cs.attrFill);
    ell.setAttribute('stroke', sel ? cs.selStroke : cs.attrStroke);
    ell.setAttribute('stroke-width', sel ? '2.5' : '1.2');
    g.appendChild(ell);

    const txt = document.createElementNS(svgNS, 'text');
    txt.setAttribute('x', String(a.x)); txt.setAttribute('y', String(a.y + 4));
    txt.setAttribute('text-anchor', 'middle'); txt.setAttribute('dominant-baseline', 'central');
    txt.setAttribute('font-size', '12');
    txt.setAttribute('font-family', 'var(--font-sans, system-ui, sans-serif)');
    txt.setAttribute('fill', a.isKey ? cs.selStroke : cs.attrText);
    txt.setAttribute('font-weight', a.isKey ? '600' : '400');
    if (a.isKey) txt.setAttribute('text-decoration', 'underline');
    txt.textContent = trunc(a.name, 8);
    g.appendChild(txt);
    mainG.appendChild(g);
  }

  // ---- Relationships (diamonds) ----
  for (const r of state.relationships) {
    const g = document.createElementNS(svgNS, 'g');
    g.setAttribute('class', 'er-node'); g.setAttribute('data-id', r.id);
    g.setAttribute('data-kind', 'relationship'); g.style.cursor = 'grab';
    const sel = state.selectedId === r.id;

    const pts = [
      `${r.x},${r.y - REL_HH}`, `${r.x + REL_HW},${r.y}`,
      `${r.x},${r.y + REL_HH}`, `${r.x - REL_HW},${r.y}`,
    ].join(' ');

    const poly = document.createElementNS(svgNS, 'polygon');
    poly.setAttribute('points', pts); poly.setAttribute('fill', cs.relFill);
    poly.setAttribute('stroke', sel ? cs.selStroke : cs.relStroke);
    poly.setAttribute('stroke-width', sel ? '2.5' : '1.5');
    poly.setAttribute('filter', 'url(#er-shadow)');
    g.appendChild(poly);

    const txt = document.createElementNS(svgNS, 'text');
    txt.setAttribute('x', String(r.x)); txt.setAttribute('y', String(r.y + 5));
    txt.setAttribute('text-anchor', 'middle'); txt.setAttribute('dominant-baseline', 'central');
    txt.setAttribute('font-size', '13'); txt.setAttribute('font-weight', '600');
    txt.setAttribute('font-family', 'var(--font-sans, system-ui, sans-serif)');
    txt.setAttribute('fill', cs.relText);
    txt.textContent = trunc(r.name, 10);
    g.appendChild(txt);
    mainG.appendChild(g);
  }
}

function trunc(s: string, max: number): string {
  return s.length > max ? s.substring(0, max - 1) + '…' : s;
}

// =============================================================================
// Auto-layout
// =============================================================================

function autoLayout(state: ERState): void {
  const eMap = new Map(state.entities.map(e => [e.id, e]));
  if (state.entities.length === 0) return;

  // ---- Build adjacency & classify entities ----

  const adj = new Map<string, string[]>();
  const nSideCount = new Map<string, number>();
  for (const e of state.entities) {
    adj.set(e.id, []);
    nSideCount.set(e.id, 0);
  }

  for (const r of state.relationships) {
    const ids = r.connections.map(c => c.entityId);
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        adj.get(ids[i])!.push(ids[j]);
        adj.get(ids[j])!.push(ids[i]);
      }
    }
    for (const c of r.connections) {
      if (c.cardinality === 'N' || c.cardinality === 'M') {
        nSideCount.set(c.entityId, nSideCount.get(c.entityId)! + 1);
      }
    }
  }

  // Junction tables: N-side of ≥2 relationships, at most 1 non-key attribute
  const junctions = new Set<string>();
  for (const e of state.entities) {
    const own = state.attributes.filter(a => a.parentId === e.id && !a.isKey).length;
    if (nSideCount.get(e.id)! >= 2 && own <= 1) junctions.add(e.id);
  }

  // ---- Find center: non-junction with highest degree ----
  let centerId = state.entities[0].id;
  let maxDeg = -1;
  for (const e of state.entities) {
    if (!junctions.has(e.id) && adj.get(e.id)!.length > maxDeg) {
      maxDeg = adj.get(e.id)!.length;
      centerId = e.id;
    }
  }

  const CENTER_X = 600, CENTER_Y = 420;
  const RING_RADIUS = [0, 440, 800, 1140];

  // ---- BFS from center (traverse through junctions) ----
  const visited = new Set<string>();
  const rings: { id: string; parent: string | null }[][] = [];
  visited.add(centerId);
  rings.push([{ id: centerId, parent: null }]);

  const bfsQueue: { id: string; parent: string; dist: number }[] = [];
  bfsQueue.push({ id: centerId, parent: '', dist: 0 });

  while (bfsQueue.length > 0) {
    const cur = bfsQueue.shift()!;
    const dist = cur.dist + 1;
    for (const nb of adj.get(cur.id)!) {
      if (visited.has(nb)) continue;
      visited.add(nb);
      if (!rings[dist]) rings[dist] = [];
      rings[dist].push({ id: nb, parent: cur.id });
      bfsQueue.push({ id: nb, parent: cur.id, dist });
    }
  }

  // ---- Assign angular positions per ring (radial distribution) ----
  const parentAngle = new Map<string, number>();
  parentAngle.set(centerId, 0);

  for (let ring = 1; ring < rings.length; ring++) {
    const nonJunc = rings[ring].filter(n => !junctions.has(n.id));
    const n = nonJunc.length;

    if (n === 1) {
      // Single entity: use parent's angle
      const pa = parentAngle.get(nonJunc[0].parent!) ?? 0;
      parentAngle.set(nonJunc[0].id, pa);
    } else if (n > 1) {
      // Multiple entities: use parent angles to determine a sensible start,
      // then distribute evenly
      let baseAngle = 0;
      let baseCount = 0;
      for (const node of nonJunc) {
        if (node.parent && parentAngle.has(node.parent)) {
          baseAngle += parentAngle.get(node.parent)!;
          baseCount++;
        }
      }
      const startAngle = baseCount > 0 ? baseAngle / baseCount - Math.PI / 4 : -Math.PI / 2;

      for (let i = 0; i < n; i++) {
        const angle = startAngle + (2 * Math.PI * i) / n;
        parentAngle.set(nonJunc[i].id, angle);
      }
    }

    // Junction tables inherit their parent's angle
    for (const node of rings[ring]) {
      if (junctions.has(node.id) && node.parent) {
        const pa = parentAngle.get(node.parent);
        if (pa !== undefined) parentAngle.set(node.id, pa);
      }
    }
  }

  // ---- Place all non-junction entities radially ----
  const placed = new Map<string, { x: number; y: number }>();
  const center = eMap.get(centerId)!;
  center.x = CENTER_X;
  center.y = CENTER_Y;
  placed.set(centerId, { x: CENTER_X, y: CENTER_Y });

  for (let ring = 1; ring < rings.length; ring++) {
    const r = RING_RADIUS[Math.min(ring, RING_RADIUS.length - 1)];
    for (const node of rings[ring]) {
      if (junctions.has(node.id)) continue;
      const angle = parentAngle.get(node.id);
      if (angle === undefined) continue;
      const e = eMap.get(node.id)!;
      e.x = CENTER_X + Math.cos(angle) * r;
      e.y = CENTER_Y + Math.sin(angle) * r;
      placed.set(node.id, { x: e.x, y: e.y });
    }
  }

  // ---- Place junction tables between their connected entities ----
  for (const jtId of junctions) {
    const nbs = adj.get(jtId)!;
    const placedNbs = nbs.filter(id => placed.has(id));
    const e = eMap.get(jtId)!;

    if (placedNbs.length >= 2) {
      const a = placed.get(placedNbs[0])!;
      const b = placed.get(placedNbs[1])!;
      e.x = (a.x + b.x) / 2;
      e.y = (a.y + b.y) / 2 + 70;
    } else if (placedNbs.length === 1) {
      const p = placed.get(placedNbs[0])!;
      const angle = parentAngle.get(jtId) ?? 0;
      e.x = p.x + Math.cos(angle) * 250;
      e.y = p.y + Math.sin(angle) * 250;
    } else {
      e.x = CENTER_X + 220;
      e.y = CENTER_Y + 220;
    }
    placed.set(jtId, { x: e.x, y: e.y });
  }

  // ---- Resolve entity overlaps iteratively ----
  const MIN_DX = ENT_W + 120;  // minimum horizontal gap between entity centers
  const MIN_DY = ENT_H + 180;  // minimum vertical gap (accounts for attr rows below)

  for (let iter = 0; iter < 80; iter++) {
    let moved = false;
    for (let i = 0; i < state.entities.length; i++) {
      for (let j = i + 1; j < state.entities.length; j++) {
        const a = state.entities[i];
        const b = state.entities[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const adx = Math.abs(dx) || 0.01;
        const ady = Math.abs(dy) || 0.01;

        const overlapX = MIN_DX - adx;
        const overlapY = MIN_DY - ady;
        if (overlapX <= 0 || overlapY <= 0) continue;

        moved = true;
        // Push along the axis with greater overlap, proportional to overlap
        const pushX = (overlapX / 2) * Math.sign(dx);
        const pushY = (overlapY / 2) * Math.sign(dy);

        // Push the entity farther from center more, the nearer one less
        const distA = Math.hypot(a.x - CENTER_X, a.y - CENTER_Y);
        const distB = Math.hypot(b.x - CENTER_X, b.y - CENTER_Y);
        const wA = distB / (distA + distB + 0.01);
        const wB = distA / (distA + distB + 0.01);

        a.x -= pushX * wA;
        a.y -= pushY * wA;
        b.x += pushX * wB;
        b.y += pushY * wB;
      }
    }
    if (!moved) break;
  }

  // ---- Place attributes below their parent entity ----
  const ATTRS_PER_ROW = 4;
  const ATTR_GAP_X = ATTR_RX * 2 + 24;
  const ATTR_GAP_Y = ATTR_RY * 2 + 16;

  for (const e of state.entities) {
    const attrs = state.attributes.filter(a => a.parentId === e.id);
    attrs.forEach((a, j) => {
      const row = Math.floor(j / ATTRS_PER_ROW);
      const col = j % ATTRS_PER_ROW;
      const inRow = Math.min(ATTRS_PER_ROW, attrs.length - row * ATTRS_PER_ROW);
      const rowWidth = (inRow - 1) * ATTR_GAP_X;
      a.x = e.x - rowWidth / 2 + col * ATTR_GAP_X;
      a.y = e.y + ENT_H / 2 + 44 + row * ATTR_GAP_Y;
    });
  }

  // Position relationship attributes
  for (const r of state.relationships) {
    const attrs = state.attributes.filter(a => a.parentId === r.id);
    attrs.forEach((a, j) => {
      a.x = r.x + REL_HW + 40;
      a.y = r.y + j * 50;
    });
  }

  // ---- Position relationship diamonds between connected entities ----
  for (const r of state.relationships) {
    let cx = 0, cy = 0, n = 0;
    for (const conn of r.connections) {
      const e = eMap.get(conn.entityId);
      if (!e) continue;
      cx += e.x; cy += e.y; n++;
    }
    if (n > 0) { r.x = cx / n; r.y = cy / n; }
  }
}

// =============================================================================
// SQL Parser
// =============================================================================

function findMatchingParen(sql: string, openPos: number): number {
  let depth = 1;
  for (let i = openPos + 1; i < sql.length; i++) {
    if (sql[i] === '(') depth++;
    else if (sql[i] === ')') { depth--; if (depth === 0) return i; }
  }
  return -1;
}

function splitBody(body: string): string[] {
  const parts: string[] = [];
  let depth = 0, start = 0;
  for (let i = 0; i < body.length; i++) {
    if (body[i] === '(') depth++;
    else if (body[i] === ')') depth--;
    else if (body[i] === ',' && depth === 0) {
      parts.push(body.substring(start, i).trim()); start = i + 1;
    }
  }
  const last = body.substring(start).trim();
  if (last) parts.push(last);
  return parts;
}

function unquote(s: string): string {
  return s.replace(/^[`"\[\]]|[`"\]\]]$/g, '');
}

function parseSQL(sql: string): ERState {
  const state: ERState = {
    entities: [], attributes: [], relationships: [],
    selectedId: null, zoom: 1, panX: 20, panY: 20,
  };
  _nextId = 1;

  const re = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:`|"|\[)?(\w+)(?:`|"|\])?\s*\(/gi;
  let match;

  while ((match = re.exec(sql)) !== null) {
    const tableName = match[1];
    const openPos = match.index + match[0].length - 1;
    const closePos = findMatchingParen(sql, openPos);
    if (closePos === -1) continue;

    const entity: EntityNode = { id: genId('e'), name: tableName, x: 0, y: 0 };
    state.entities.push(entity);

    const body = sql.substring(openPos + 1, closePos);
    const lines = splitBody(body);
    const fks: { cols: string[]; refTable: string }[] = [];

    for (const raw of lines) {
      const s = raw.trim();
      if (!s) continue;

      // Table-level PK
      let m = s.match(/^\s*PRIMARY\s+KEY\s*\(([^)]+)\)/i);
      if (m) {
        const pks = m[1].split(',').map(c => unquote(c.trim()));
        for (const a of state.attributes) {
          if (a.parentId === entity.id && pks.includes(a.name)) a.isKey = true;
        }
        continue;
      }

      // Skip UNIQUE, CHECK, INDEX (not FK)
      if (/^\s*(UNIQUE|CHECK|INDEX|KEY)\s/i.test(s) && !/FOREIGN/i.test(s)) continue;

      // Table-level FK
      m = s.match(/(?:CONSTRAINT\s+\S+\s+)?FOREIGN\s+KEY\s*\(([^)]+)\)\s*REFERENCES\s+(?:`|"|\[)?(\w+)(?:`|"|\])?\s*\(([^)]+)\)/i);
      if (m) {
        fks.push({ cols: m[1].split(',').map(c => unquote(c.trim())), refTable: m[2] });
        continue;
      }

      // Column definition
      const colMatch = s.match(/^\s*(?:`|"|\[)?(\w+)(?:`|"|\])?\s+/);
      if (!colMatch) continue;
      const colName = colMatch[1];
      const rest = s.substring(colMatch[0].length);

      const isPK = /PRIMARY\s+KEY/i.test(rest);

      const attr: AttrNode = {
        id: genId('a'), name: colName, parentId: entity.id,
        x: 0, y: 0, isKey: isPK,
      };
      state.attributes.push(attr);

      // Inline FK
      const refMatch = rest.match(/REFERENCES\s+(?:`|"|\[)?(\w+)(?:`|"|\])?\s*\(([^)]+)\)/i);
      if (refMatch) {
        fks.push({ cols: [colName], refTable: refMatch[1] });
      }
    }

    // Create relationships from FKs
    for (const fk of fks) {
      let refEntity = state.entities.find(e => e.name.toLowerCase() === fk.refTable.toLowerCase());
      if (!refEntity) {
        refEntity = { id: genId('e'), name: fk.refTable, x: 0, y: 0 };
        state.entities.push(refEntity);
      }
      const rel: RelNode = {
        id: genId('r'), name: `${entity.name}_${fk.refTable}`, x: 0, y: 0,
        connections: [
          { entityId: entity.id, cardinality: 'N', totalParticipation: true },
          { entityId: refEntity.id, cardinality: '1', totalParticipation: false },
        ],
      };
      state.relationships.push(rel);
    }
  }

  autoLayout(state);
  return state;
}

// =============================================================================
// Sample SQL
// =============================================================================

const SAMPLE_SQL = `-- 博客系统数据库 Schema
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),
    bio TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE posts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    content TEXT NOT NULL,
    excerpt TEXT,
    status VARCHAR(20) DEFAULT 'draft',
    view_count INT DEFAULT 0,
    user_id INT NOT NULL,
    category_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    slug VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    parent_id INT,
    FOREIGN KEY (parent_id) REFERENCES categories(id)
);

CREATE TABLE comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    content TEXT NOT NULL,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    parent_comment_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (parent_comment_id) REFERENCES comments(id)
);

CREATE TABLE tags (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    slug VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE post_tags (
    post_id INT NOT NULL,
    tag_id INT NOT NULL,
    PRIMARY KEY (post_id, tag_id),
    FOREIGN KEY (post_id) REFERENCES posts(id),
    FOREIGN KEY (tag_id) REFERENCES tags(id)
);
`;

// =============================================================================
// Tool Module
// =============================================================================

let parseTimer: number | null = null;

export default {
  id: 'sql-er-diagram',
  name: 'ER 实体关系图',
  icon: 'network',

  render(container: HTMLElement) {
    // Local state — fresh each render
    let state = parseSQL(SAMPLE_SQL);

    let dragInfo: { id: string; startX: number; startY: number; origX: number; origY: number; kind: string; origAttrs: { id: string; x: number; y: number }[] } | null = null;
    let panInfo: { startX: number; startY: number; origPanX: number; origPanY: number } | null = null;
    let mouseMoved = false;

    // ---- HTML template ----
    container.innerHTML = `
      <div class="content" style="max-width:100%;">
        <div class="tool-page-header">
          <a href="#/code" class="tool-page-back">${icon('code')} 代码工具</a>
          <h1 style="font: var(--text-headline-md);">ER 实体关系图</h1>
          <p style="font: var(--text-body-md); color: var(--color-on-surface-variant);">
            基于 Chen 记法的实体关系建模工具 — 矩形实体 · 椭圆属性 · 菱形联系 · 1:1 / 1:N / M:N
          </p>
        </div>

        <!-- Toolbar -->
        <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap; margin-bottom:12px;">
          <button class="btn" id="er-parse" style="background:#16a34a; color:#fff; padding:10px 20px; border-radius:8px; font:var(--text-label-md); font-weight:600; border:none; cursor:pointer;">
            ${icon('wand', 16)} 解析并生成
          </button>
          <button class="btn btn-secondary" id="er-add-entity">${icon('grid_view', 16)} 添加实体</button>
          <button class="btn btn-secondary" id="er-add-attr">${icon('tag', 16)} 添加属性</button>
          <button class="btn btn-secondary" id="er-add-rel">${icon('link', 16)} 添加联系</button>
          <span style="flex:1;"></span>
          <button class="btn btn-ghost" id="er-auto-layout" style="color:#d97706;">${icon('shuffle', 16)} 自动布局</button>
          <button class="btn btn-ghost" id="er-fit" style="color:#d97706;">${icon('preview', 16)} 适应画布</button>
          <button class="btn btn-ghost" id="er-clear">${icon('close', 16)} 清空</button>
        </div>

        <!-- Main split -->
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px; height:calc(100vh - 260px); min-height:500px;">
          <!-- Left: SQL Input -->
          <div style="display:flex; flex-direction:column; height:100%;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
              <label class="tool-label" style="margin:0;">SQL DDL 输入</label>
              <div style="display:flex; gap:4px;">
                <button class="btn btn-ghost" id="er-sample" style="font:var(--text-label-md); color:#d97706;">${icon('dictionary', 14)} 填入示例</button>
                <button class="btn btn-ghost" id="er-import-file" style="font:var(--text-label-md); color:#d97706;">${icon('upload', 14)} 导入文件</button>
              </div>
            </div>
            <textarea id="er-sql-input" class="tool-textarea" style="flex:1; resize:none; font-family:var(--font-mono); font-size:12px; min-height:300px;" placeholder="粘贴 CREATE TABLE 语句...&#10;支持 MySQL / PostgreSQL / SQLite 语法"></textarea>
            <div id="er-stats" style="font:var(--text-label-md); color:var(--color-on-surface-variant); margin-top:6px;"></div>
            <div id="er-error" style="color:var(--color-error); font:var(--text-label-md); margin-top:4px; display:none;"></div>
          </div>

          <!-- Right: ER Diagram -->
          <div style="display:flex; flex-direction:column; height:100%;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
              <div>
                <label class="tool-label" style="margin:0;">ER 图预览 (Chen 记法) — 拖拽移动 · 滚轮缩放 · 点击选中 · Delete 删除</label>
                <span style="display:block; font-size:11px; color:var(--color-on-surface-variant); margin-top:2px;">提示：自动布局可能存在重叠，请自行拖拽优化布局</span>
              </div>
              <div style="display:flex; align-items:center; gap:4px;">
                <button class="btn btn-ghost" id="er-zoom-out" title="缩小">${icon('search', 14)}</button>
                <span id="er-zoom-label" style="font:var(--text-label-md); min-width:40px; text-align:center;">100%</span>
                <button class="btn btn-ghost" id="er-zoom-in" style="font-size:16px;font-weight:600;">+</button>
                <button class="btn btn-ghost" id="er-zoom-reset" title="重置缩放">⊡</button>
              </div>
            </div>
            <div id="er-canvas" style="flex:1; border:1px solid var(--color-outline-variant); border-radius:8px; overflow:hidden; background:var(--color-surface); position:relative; cursor:grab;">
              <div id="er-empty-hint" style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); text-align:center; color:var(--color-on-surface-variant); pointer-events:none; display:none;">
                <span style="font-size:40px; line-height:1;">&#x1F4CA;</span>
                <p style="margin-top:8px; font:var(--text-body-md);">在左侧输入 SQL 并点击「解析并生成」</p>
              </div>
            </div>
            <div style="display:flex; align-items:center; gap:8px; margin-top:6px;">
              <span style="flex:1;"></span>
              <button class="btn btn-ghost" id="er-copy-svg">${icon('content_copy', 14)} 复制 SVG</button>
              <button class="btn btn-ghost" id="er-export-png">${icon('download', 14)} 导出 PNG</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // ---- Element refs ----
    const sqlInput = container.querySelector('#er-sql-input') as HTMLTextAreaElement;
    const canvasEl = container.querySelector('#er-canvas') as HTMLElement;
    const emptyHint = container.querySelector('#er-empty-hint') as HTMLElement;
    const statsEl = container.querySelector('#er-stats') as HTMLElement;
    const errorEl = container.querySelector('#er-error') as HTMLElement;
    const zoomLabel = container.querySelector('#er-zoom-label') as HTMLElement;

    // ---- Helpers ----
    function getEl(id: string): EntityNode | AttrNode | RelNode | undefined {
      return state.entities.find(e => e.id === id) ??
             state.attributes.find(a => a.id === id) ??
             state.relationships.find(r => r.id === id);
    }

    function getElKind(id: string): 'entity' | 'attribute' | 'relationship' | null {
      if (state.entities.some(e => e.id === id)) return 'entity';
      if (state.attributes.some(a => a.id === id)) return 'attribute';
      if (state.relationships.some(r => r.id === id)) return 'relationship';
      return null;
    }

    function deleteElement(id: string) {
      const kind = getElKind(id);
      if (!kind) return;
      if (kind === 'entity') {
        state.attributes = state.attributes.filter(a => a.parentId !== id);
        // Remove relationships connected to this entity and their attributes
        const relsToDel = state.relationships.filter(r => r.connections.some(c => c.entityId === id));
        for (const r of relsToDel) {
          state.attributes = state.attributes.filter(a => a.parentId !== r.id);
        }
        state.relationships = state.relationships.filter(r => !relsToDel.includes(r));
        state.entities = state.entities.filter(e => e.id !== id);
      } else if (kind === 'attribute') {
        state.attributes = state.attributes.filter(a => a.id !== id);
      } else if (kind === 'relationship') {
        state.attributes = state.attributes.filter(a => a.parentId !== id);
        state.relationships = state.relationships.filter(r => r.id !== id);
      }
      if (state.selectedId === id) state.selectedId = null;
    }

    function updateStats() {
      const totalCols = state.attributes.length;
      const totalFKs = state.relationships.length;
      statsEl.textContent = `已解析 ${state.entities.length} 张表，${totalCols} 个字段，${totalFKs} 个外键关系`;
      const total = state.entities.length + state.relationships.length;
      emptyHint.style.display = total === 0 ? '' : 'none';
    }

    function updateZoomLabel() {
      zoomLabel.textContent = Math.round(state.zoom * 100) + '%';
    }

    function redraw() {
      const total = state.entities.length + state.relationships.length;
      if (total === 0) {
        emptyHint.style.display = '';
        const svg = canvasEl.querySelector('#er-diagram-svg');
        if (svg) svg.remove();
      } else {
        emptyHint.style.display = 'none';
        renderDiagram(canvasEl, state);
      }
      updateZoomLabel();
      updateStats();
    }

    // ---- Interaction ----
    function setupInteraction() {
      function onMouseDown(e: MouseEvent) {
        mouseMoved = false;
        const nodeEl = (e.target as Element).closest('.er-node') as SVGGElement | null;

        if (nodeEl) {
          const id = nodeEl.getAttribute('data-id');
          const kind = nodeEl.getAttribute('data-kind');
          if (!id || !kind) return;
          const el = getEl(id);
          if (!el) return;

          dragInfo = {
            id, startX: e.clientX, startY: e.clientY,
            origX: el.x, origY: el.y, kind,
            origAttrs: kind === 'entity'
              ? state.attributes.filter(a => a.parentId === id).map(a => ({ id: a.id, x: a.x, y: a.y }))
              : [],
          };
          e.preventDefault();
        } else {
          panInfo = {
            startX: e.clientX, startY: e.clientY,
            origPanX: state.panX, origPanY: state.panY,
          };
        }
      }

      function onMouseMove(e: MouseEvent) {
        if (!dragInfo && !panInfo) return;
        if (Math.abs(e.clientX - (dragInfo?.startX ?? panInfo!.startX)) > 3 ||
            Math.abs(e.clientY - (dragInfo?.startY ?? panInfo!.startY)) > 3) {
          mouseMoved = true;
        }
        if (dragInfo && mouseMoved) {
          const dx = (e.clientX - dragInfo.startX) / state.zoom;
          const dy = (e.clientY - dragInfo.startY) / state.zoom;
          const el = getEl(dragInfo.id);
          if (!el) return;
          el.x = dragInfo.origX + dx;
          el.y = dragInfo.origY + dy;
          // Move child attributes
          for (const oa of dragInfo.origAttrs) {
            const attr = state.attributes.find(a => a.id === oa.id);
            if (attr) { attr.x = oa.x + dx; attr.y = oa.y + dy; }
          }
          redraw();
        } else if (panInfo && mouseMoved) {
          state.panX = panInfo.origPanX + (e.clientX - panInfo.startX);
          state.panY = panInfo.origPanY + (e.clientY - panInfo.startY);
          redraw();
        }
      }

      function onMouseUp(_e: MouseEvent) {
        if (!mouseMoved) {
          if (dragInfo) {
            state.selectedId = dragInfo.id;
          } else {
            state.selectedId = null;
          }
          redraw();
        }
        dragInfo = null;
        panInfo = null;
      }

      function onWheel(e: WheelEvent) {
        e.preventDefault();
        const rect = canvasEl.getBoundingClientRect();
        const mx = e.clientX - rect.left, my = e.clientY - rect.top;
        const oldZoom = state.zoom;
        state.zoom = Math.max(0.15, Math.min(4, state.zoom + (e.deltaY > 0 ? -0.12 : 0.12)));
        const ratio = state.zoom / oldZoom;
        state.panX = mx - ratio * (mx - state.panX);
        state.panY = my - ratio * (my - state.panY);
        redraw();
      }

      function onContextMenu(e: MouseEvent) {
        const nodeEl = (e.target as Element).closest('.er-node') as SVGGElement | null;
        if (nodeEl) {
          e.preventDefault();
          const id = nodeEl.getAttribute('data-id');
          if (id) deleteElement(id);
          redraw();
        }
      }

      function onDblClick(e: MouseEvent) {
        const nodeEl = (e.target as Element).closest('.er-node') as SVGGElement | null;
        if (!nodeEl) return;
        const id = nodeEl.getAttribute('data-id');
        if (!id) return;
        const el = getEl(id);
        if (!el) return;
        const newName = prompt('重命名:', el.name);
        if (newName !== null && newName.trim()) {
          el.name = newName.trim();
          redraw();
        }
      }

      function onKeyDown(e: KeyboardEvent) {
        if ((e.key === 'Delete' || e.key === 'Backspace') && state.selectedId) {
          const tag = document.activeElement?.tagName;
          if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
            e.preventDefault();
            deleteElement(state.selectedId);
            redraw();
          }
        }
        if (e.key === 'Escape') { state.selectedId = null; redraw(); }
      }

      canvasEl.addEventListener('mousedown', onMouseDown);
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      canvasEl.addEventListener('wheel', onWheel, { passive: false });
      canvasEl.addEventListener('contextmenu', onContextMenu);
      canvasEl.addEventListener('dblclick', onDblClick);
      window.addEventListener('keydown', onKeyDown);

      return () => {
        canvasEl.removeEventListener('mousedown', onMouseDown);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
        canvasEl.removeEventListener('wheel', onWheel);
        canvasEl.removeEventListener('contextmenu', onContextMenu);
        canvasEl.removeEventListener('dblclick', onDblClick);
        window.removeEventListener('keydown', onKeyDown);
      };
    }

    // ---- Export helpers ----
    function buildExportSVG(): string {
      const svg = canvasEl.querySelector('#er-diagram-svg');
      if (!svg) return '';

      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const e of state.entities) {
        minX = Math.min(minX, e.x - ENT_W / 2); maxX = Math.max(maxX, e.x + ENT_W / 2);
        minY = Math.min(minY, e.y - ENT_H / 2); maxY = Math.max(maxY, e.y + ENT_H / 2);
      }
      for (const a of state.attributes) {
        minX = Math.min(minX, a.x - ATTR_RX); maxX = Math.max(maxX, a.x + ATTR_RX);
        minY = Math.min(minY, a.y - ATTR_RY); maxY = Math.max(maxY, a.y + ATTR_RY);
      }
      for (const r of state.relationships) {
        minX = Math.min(minX, r.x - REL_HW); maxX = Math.max(maxX, r.x + REL_HW);
        minY = Math.min(minY, r.y - REL_HH); maxY = Math.max(maxY, r.y + REL_HH);
      }
      if (!isFinite(minX)) return '';

      const PAD = 30;
      const vbW = maxX - minX + PAD * 2, vbH = maxY - minY + PAD * 2;
      const clone = svg.cloneNode(true) as SVGSVGElement;
      clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      clone.setAttribute('viewBox', `${minX - PAD} ${minY - PAD} ${vbW} ${vbH}`);
      clone.setAttribute('width', String(vbW));
      clone.setAttribute('height', String(vbH));
      clone.removeAttribute('style');

      const mainG = clone.querySelector('g[transform]');
      if (mainG) mainG.setAttribute('transform', 'translate(0,0) scale(1)');

      return new XMLSerializer().serializeToString(clone);
    }

    function copyFallback(text: string) {
      const ta = document.createElement('textarea');
      ta.value = text; ta.style.cssText = 'position:fixed;left:-9999px;';
      document.body.appendChild(ta); ta.select(); document.execCommand('copy');
      document.body.removeChild(ta);
    }

    // ---- Debounced parse from textarea ----
    function scheduleParse() {
      if (parseTimer !== null) clearTimeout(parseTimer);
      parseTimer = window.setTimeout(() => {
        const sql = sqlInput.value.trim();
        errorEl.style.display = 'none';
        if (!sql) {
          state = { entities: [], attributes: [], relationships: [], selectedId: null, zoom: 1, panX: 20, panY: 20 };
        } else {
          try {
            state = parseSQL(sql);
            if (state.entities.length === 0 && sql.length > 0) {
              errorEl.textContent = '未找到有效的 CREATE TABLE 语句';
              errorEl.style.display = '';
            }
          } catch (err: any) {
            errorEl.textContent = '解析失败: ' + (err.message || '');
            errorEl.style.display = '';
            state = { entities: [], attributes: [], relationships: [], selectedId: null, zoom: 1, panX: 20, panY: 20 };
          }
        }
        redraw();
        parseTimer = null;
      }, DEBOUNCE_MS);
    }

    // ---- Wire buttons ----
    sqlInput.value = SAMPLE_SQL;
    sqlInput.addEventListener('input', scheduleParse);

    container.querySelector('#er-parse')!.addEventListener('click', () => {
      const sql = sqlInput.value.trim();
      errorEl.style.display = 'none';
      if (!sql) {
        state = { entities: [], attributes: [], relationships: [], selectedId: null, zoom: 1, panX: 20, panY: 20 };
      } else {
        try {
          state = parseSQL(sql);
          if (state.entities.length === 0) {
            errorEl.textContent = '未找到有效的 CREATE TABLE 语句';
            errorEl.style.display = '';
          }
        } catch (err: any) {
          errorEl.textContent = '解析失败: ' + (err.message || '');
          errorEl.style.display = '';
        }
      }
      redraw();
    });

    container.querySelector('#er-sample')!.addEventListener('click', () => {
      sqlInput.value = SAMPLE_SQL;
      errorEl.style.display = 'none';
      state = parseSQL(SAMPLE_SQL);
      redraw();
    });

    container.querySelector('#er-import-file')!.addEventListener('click', () => {
      const inp = document.createElement('input');
      inp.type = 'file'; inp.accept = '.sql,.txt';
      inp.onchange = () => {
        const file = inp.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          sqlInput.value = reader.result as string;
          sqlInput.dispatchEvent(new Event('input'));
        };
        reader.readAsText(file);
      };
      inp.click();
    });

    container.querySelector('#er-add-entity')!.addEventListener('click', () => {
      const rect = canvasEl.getBoundingClientRect();
      const cx = rect.width / 2, cy = rect.height / 2;
      const e: EntityNode = {
        id: genId('e'), name: `实体_${state.entities.length + 1}`,
        x: (cx - state.panX) / state.zoom, y: (cy - state.panY) / state.zoom,
      };
      state.entities.push(e);
      state.selectedId = e.id;
      redraw();
    });

    container.querySelector('#er-add-attr')!.addEventListener('click', () => {
      if (!state.selectedId) {
        errorEl.textContent = '请先选中一个实体或联系'; errorEl.style.display = '';
        return;
      }
      const kind = getElKind(state.selectedId);
      if (kind !== 'entity' && kind !== 'relationship') {
        errorEl.textContent = '属性只能添加到实体或联系上'; errorEl.style.display = '';
        return;
      }
      errorEl.style.display = 'none';
      const parent = getEl(state.selectedId)!;
      const total = state.attributes.filter(a => a.parentId === state.selectedId).length;
      const a: AttrNode = {
        id: genId('a'), name: `属性_${total + 1}`, parentId: state.selectedId,
        x: parent.x + 90, y: parent.y + 40 + total * 30,
        isKey: false,
      };
      state.attributes.push(a);
      state.selectedId = a.id;
      redraw();
    });

    container.querySelector('#er-add-rel')!.addEventListener('click', () => {
      if (state.entities.length < 2) {
        errorEl.textContent = '至少需要两个实体才能创建联系'; errorEl.style.display = '';
        return;
      }
      errorEl.style.display = 'none';
      const e1 = state.entities[0];
      const e2 = state.entities.length > 1 ? state.entities[1] : e1;
      const mx = (e1.x + e2.x) / 2, my = (e1.y + e2.y) / 2 - 120;
      const rel: RelNode = {
        id: genId('r'), name: `联系_${state.relationships.length + 1}`, x: mx, y: my,
        connections: [
          { entityId: e1.id, cardinality: '1', totalParticipation: false },
          { entityId: e2.id, cardinality: 'N', totalParticipation: true },
        ],
      };
      state.relationships.push(rel);
      state.selectedId = rel.id;
      redraw();
    });

    container.querySelector('#er-auto-layout')!.addEventListener('click', () => {
      autoLayout(state);
      state.panX = 20; state.panY = 20; state.zoom = 1;
      state.selectedId = null;
      redraw();
    });

    container.querySelector('#er-fit')!.addEventListener('click', () => {
      if (state.entities.length === 0) return;
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const e of state.entities) {
        minX = Math.min(minX, e.x - ENT_W / 2); maxX = Math.max(maxX, e.x + ENT_W / 2);
        minY = Math.min(minY, e.y - ENT_H / 2); maxY = Math.max(maxY, e.y + ENT_H / 2);
      }
      const rect = canvasEl.getBoundingClientRect();
      const bw = maxX - minX || 200, bh = maxY - minY || 200;
      state.zoom = Math.min((rect.width - 60) / bw, (rect.height - 60) / bh, 1.5);
      state.panX = (rect.width - bw * state.zoom) / 2 - minX * state.zoom + 10;
      state.panY = (rect.height - bh * state.zoom) / 2 - minY * state.zoom + 10;
      redraw();
    });

    container.querySelector('#er-clear')!.addEventListener('click', () => {
      if (confirm('确定清空所有元素？')) {
        state = { entities: [], attributes: [], relationships: [], selectedId: null, zoom: 1, panX: 20, panY: 20 };
        sqlInput.value = '';
        redraw();
      }
    });

    container.querySelector('#er-zoom-in')!.addEventListener('click', () => {
      state.zoom = Math.min(4, state.zoom + 0.25); redraw();
    });
    container.querySelector('#er-zoom-out')!.addEventListener('click', () => {
      state.zoom = Math.max(0.15, state.zoom - 0.25); redraw();
    });
    container.querySelector('#er-zoom-reset')!.addEventListener('click', () => {
      state.zoom = 1; state.panX = 20; state.panY = 20; redraw();
    });

    container.querySelector('#er-copy-svg')!.addEventListener('click', async () => {
      const data = buildExportSVG();
      if (!data) return;
      try { await navigator.clipboard.writeText(data); }
      catch { copyFallback(data); }
    });

    container.querySelector('#er-export-png')!.addEventListener('click', () => {
      const data = buildExportSVG();
      if (!data) return;
      const img = new Image();
      const blob = new Blob([data], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      img.onload = () => {
        const scale = 2;
        const canvas = document.createElement('canvas');
        canvas.width = img.width * scale; canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d')!;
        ctx.scale(scale, scale);
        const dark = document.documentElement.classList.contains('dark');
        ctx.fillStyle = dark ? '#1a1a2e' : '#fafbfd';
        ctx.fillRect(0, 0, img.width, img.height);
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        canvas.toBlob((b) => {
          if (!b) return;
          const a = document.createElement('a');
          a.href = URL.createObjectURL(b);
          a.download = 'er-diagram.png';
          a.click();
        }, 'image/png');
      };
      img.onerror = () => { URL.revokeObjectURL(url); };
      img.src = url;
    });

    // Init
    const cleanupInteraction = setupInteraction();
    redraw();

    // Store cleanup reference for destroy
    (container as any).__erCleanup = () => {
      cleanupInteraction();
      if (parseTimer !== null) { clearTimeout(parseTimer); parseTimer = null; }
    };
  },

  destroy() {
    if (parseTimer !== null) { clearTimeout(parseTimer); parseTimer = null; }
  },
};
