import { icon } from '../../core/icons';

// --- Syntax Highlighting (simplified) ---

interface LangDef {
  keywords: string[];
  commentSingle: string[];
  commentMulti: [string, string][];
  strings: string[];
}

const LANGUAGES: Record<string, LangDef> = {
  javascript: {
    keywords: ['abstract', 'arguments', 'async', 'await', 'boolean', 'break', 'byte', 'case', 'catch', 'char', 'class', 'const', 'continue', 'debugger', 'default', 'delete', 'do', 'double', 'else', 'enum', 'export', 'extends', 'false', 'final', 'finally', 'float', 'for', 'from', 'function', 'goto', 'if', 'implements', 'import', 'in', 'instanceof', 'int', 'interface', 'let', 'long', 'native', 'new', 'null', 'of', 'package', 'private', 'protected', 'public', 'return', 'short', 'static', 'super', 'switch', 'synchronized', 'this', 'throw', 'throws', 'transient', 'true', 'try', 'typeof', 'undefined', 'var', 'void', 'volatile', 'while', 'with', 'yield'],
    commentSingle: ['//'], commentMulti: [['/*', '*/']], strings: ['"', "'", '`'],
  },
  typescript: {
    keywords: ['abstract', 'as', 'async', 'await', 'boolean', 'break', 'case', 'catch', 'class', 'const', 'constructor', 'continue', 'declare', 'default', 'delete', 'do', 'else', 'enum', 'export', 'extends', 'false', 'finally', 'for', 'from', 'function', 'get', 'if', 'implements', 'import', 'in', 'instanceof', 'interface', 'keyof', 'let', 'module', 'namespace', 'new', 'null', 'number', 'of', 'package', 'private', 'protected', 'public', 'readonly', 'return', 'set', 'static', 'string', 'super', 'switch', 'this', 'throw', 'true', 'try', 'type', 'typeof', 'undefined', 'unique', 'var', 'void', 'while', 'with', 'yield'],
    commentSingle: ['//'], commentMulti: [['/*', '*/']], strings: ['"', "'", '`'],
  },
  python: {
    keywords: ['and', 'as', 'assert', 'async', 'await', 'break', 'class', 'continue', 'def', 'del', 'elif', 'else', 'except', 'False', 'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is', 'lambda', 'None', 'nonlocal', 'not', 'or', 'pass', 'raise', 'return', 'True', 'try', 'while', 'with', 'yield'],
    commentSingle: ['#'], commentMulti: [['"""', '"""'], ["'''", "'''"]], strings: ['"', "'"],
  },
  html: {
    keywords: ['DOCTYPE', 'html', 'head', 'body', 'div', 'span', 'p', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'table', 'tr', 'td', 'th', 'form', 'input', 'button', 'select', 'option', 'textarea', 'img', 'video', 'audio', 'canvas', 'svg', 'script', 'style', 'link', 'meta', 'title', 'section', 'article', 'nav', 'header', 'footer', 'main', 'aside'],
    commentSingle: [], commentMulti: [['<!--', '-->']], strings: ['"', "'"],
  },
  css: {
    keywords: ['!important', 'inherit', 'initial', 'unset', 'none', 'auto', 'normal', 'bold', 'italic', 'solid', 'dashed', 'dotted', 'relative', 'absolute', 'fixed', 'static', 'flex', 'grid', 'block', 'inline', 'inline-block', 'hidden', 'visible', 'scroll', 'center', 'left', 'right', 'top', 'bottom'],
    commentSingle: [], commentMulti: [['/*', '*/']], strings: ['"', "'"],
  },
  json: {
    keywords: ['true', 'false', 'null'],
    commentSingle: [], commentMulti: [], strings: ['"'],
  },
  java: {
    keywords: ['abstract', 'assert', 'boolean', 'break', 'byte', 'case', 'catch', 'char', 'class', 'const', 'continue', 'default', 'do', 'double', 'else', 'enum', 'extends', 'final', 'finally', 'float', 'for', 'goto', 'if', 'implements', 'import', 'instanceof', 'int', 'interface', 'long', 'native', 'new', 'package', 'private', 'protected', 'public', 'return', 'short', 'static', 'strictfp', 'super', 'switch', 'synchronized', 'this', 'throw', 'throws', 'transient', 'try', 'void', 'volatile', 'while', 'true', 'false', 'null'],
    commentSingle: ['//'], commentMulti: [['/*', '*/']], strings: ['"', "'"],
  },
  c: {
    keywords: ['auto', 'break', 'case', 'char', 'const', 'continue', 'default', 'do', 'double', 'else', 'enum', 'extern', 'float', 'for', 'goto', 'if', 'inline', 'int', 'long', 'register', 'restrict', 'return', 'short', 'signed', 'sizeof', 'static', 'struct', 'switch', 'typedef', 'union', 'unsigned', 'void', 'volatile', 'while', 'NULL', 'true', 'false', 'bool', 'include', 'define', 'ifdef', 'ifndef', 'endif', 'pragma'],
    commentSingle: ['//'], commentMulti: [['/*', '*/']], strings: ['"', "'"],
  },
  go: {
    keywords: ['break', 'case', 'chan', 'const', 'continue', 'default', 'defer', 'else', 'fallthrough', 'for', 'func', 'go', 'goto', 'if', 'import', 'interface', 'map', 'package', 'range', 'return', 'select', 'struct', 'switch', 'type', 'var', 'true', 'false', 'iota', 'nil', 'append', 'cap', 'close', 'complex', 'copy', 'delete', 'imag', 'len', 'make', 'new', 'panic', 'print', 'println', 'real', 'recover', 'string', 'int', 'int8', 'int16', 'int32', 'int64', 'uint', 'uint8', 'uint16', 'uint32', 'uint64', 'float32', 'float64', 'complex64', 'complex128', 'bool', 'byte', 'rune', 'error', 'any'],
    commentSingle: ['//'], commentMulti: [['/*', '*/']], strings: ['"', '`'],
  },
  rust: {
    keywords: ['as', 'async', 'await', 'break', 'const', 'continue', 'crate', 'dyn', 'else', 'enum', 'extern', 'false', 'fn', 'for', 'if', 'impl', 'in', 'let', 'loop', 'match', 'mod', 'move', 'mut', 'pub', 'ref', 'return', 'self', 'Self', 'static', 'struct', 'super', 'trait', 'true', 'type', 'unsafe', 'use', 'where', 'while', 'yield', 'Box', 'Option', 'Result', 'String', 'Vec', 'bool', 'char', 'f32', 'f64', 'i8', 'i16', 'i32', 'i64', 'i128', 'isize', 'str', 'u8', 'u16', 'u32', 'u64', 'u128', 'usize'],
    commentSingle: ['//'], commentMulti: [['/*', '*/']], strings: ['"', "'"],
  },
  sql: {
    keywords: ['SELECT', 'FROM', 'WHERE', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE', 'TABLE', 'ALTER', 'DROP', 'INDEX', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'ON', 'AND', 'OR', 'NOT', 'IN', 'BETWEEN', 'LIKE', 'IS', 'NULL', 'AS', 'ORDER', 'BY', 'GROUP', 'HAVING', 'LIMIT', 'OFFSET', 'UNION', 'ALL', 'DISTINCT', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES', 'CONSTRAINT', 'DEFAULT', 'AUTO_INCREMENT', 'VARCHAR', 'INT', 'INTEGER', 'TEXT', 'BOOLEAN', 'DATE', 'TIMESTAMP', 'FLOAT', 'DOUBLE', 'DECIMAL', 'EXISTS', 'ANY', 'SOME'],
    commentSingle: ['--'], commentMulti: [['/*', '*/']], strings: ['"', "'"],
  },
  bash: {
    keywords: ['if', 'then', 'else', 'elif', 'fi', 'for', 'while', 'do', 'done', 'case', 'esac', 'in', 'function', 'return', 'exit', 'echo', 'export', 'source', 'alias', 'unalias', 'set', 'unset', 'local', 'readonly', 'declare', 'eval', 'exec', 'test', 'shift', 'trap', 'wait', 'jobs', 'fg', 'bg', 'kill', 'cd', 'pwd', 'ls', 'cat', 'grep', 'sed', 'awk', 'find', 'sort', 'uniq', 'wc', 'head', 'tail', 'chmod', 'chown', 'mkdir', 'rm', 'cp', 'mv', 'touch', 'sudo', 'apt', 'true', 'false', 'null'],
    commentSingle: ['#'], commentMulti: [], strings: ['"', "'"],
  },
};

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function highlightCode(code: string, lang: string): string {
  const def = LANGUAGES[lang];
  if (!def) return escapeHtml(code);

  let escaped = escapeHtml(code);
  const tokens: { start: number; end: number; html: string; priority: number }[] = [];

  for (const single of def.commentSingle) {
    const escapedSingle = escapeHtml(single);
    const re = new RegExp(escapedSingle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '.*', 'g');
    let m;
    while ((m = re.exec(escaped)) !== null) {
      tokens.push({ start: m.index, end: m.index + m[0].length, html: `<span style="color:var(--color-syntax-comment);font-style:italic">${m[0]}</span>`, priority: 1 });
    }
  }
  for (const [open, close] of def.commentMulti) {
    const escapedOpen = escapeHtml(open);
    const escapedClose = escapeHtml(close);
    const re = new RegExp(escapedOpen.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[\\s\\S]*?' + escapedClose.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    let m;
    while ((m = re.exec(escaped)) !== null) {
      tokens.push({ start: m.index, end: m.index + m[0].length, html: `<span style="color:var(--color-syntax-comment);font-style:italic">${m[0]}</span>`, priority: 1 });
    }
  }

  for (const q of def.strings) {
    const escapedQ = escapeHtml(q);
    const re = new RegExp(escapedQ + '[^' + escapedQ + '\\\\]*(?:\\\\.[^' + escapedQ + '\\\\]*)*' + escapedQ, 'g');
    let m;
    while ((m = re.exec(escaped)) !== null) {
      tokens.push({ start: m.index, end: m.index + m[0].length, html: `<span style="color:var(--color-syntax-string)">${m[0]}</span>`, priority: 2 });
    }
  }

  const kwPattern = new RegExp('\\b(' + def.keywords.join('|') + ')\\b', 'g');
  let m;
  while ((m = kwPattern.exec(escaped)) !== null) {
    tokens.push({ start: m.index, end: m.index + m[0].length, html: `<span style="color:var(--color-syntax-keyword);font-weight:600">${m[0]}</span>`, priority: 3 });
  }

  const numRe = /\b(\d+\.?\d*(?:[eE][+-]?\d+)?)\b/g;
  while ((m = numRe.exec(escaped)) !== null) {
    tokens.push({ start: m.index, end: m.index + m[0].length, html: `<span style="color:var(--color-syntax-number)">${m[0]}</span>`, priority: 4 });
  }

  tokens.sort((a, b) => a.start - b.start || a.priority - b.priority);

  const result: string[] = [];
  let pos = 0;
  for (const tok of tokens) {
    if (tok.start >= pos) {
      result.push(escaped.slice(pos, tok.start));
      result.push(tok.html);
      pos = tok.end;
    }
  }
  result.push(escaped.slice(pos));
  return result.join('');
}

// --- Flowchart Rendering ---

interface FlowNode {
  id: string;
  text: string;
  type: 'rect' | 'diamond' | 'rounded';
}

interface FlowEdge {
  from: string;
  to: string;
  label: string;
}

function renderFlowchart(code: string): string {
  const nodes: Map<string, FlowNode> = new Map();
  const edges: FlowEdge[] = [];
  const order: string[] = [];

  for (const rawLine of code.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('//')) continue;

    // Node definition: A[Text], A{Text}, A(Text), or just A
    const nodeMatch = line.match(/^(\w+)(?:\[([^\]]*)\]|\{([^}]*)\}|(\(([^)]*)\)))?/);
    if (nodeMatch) {
      const id = nodeMatch[1];
      const text = nodeMatch[2] ?? nodeMatch[3] ?? nodeMatch[5] ?? id;
      const type: FlowNode['type'] = nodeMatch[2] !== undefined ? 'rect' : nodeMatch[3] !== undefined ? 'diamond' : nodeMatch[5] !== undefined ? 'rounded' : 'rect';
      if (!nodes.has(id)) { nodes.set(id, { id, text, type }); order.push(id); }
    }

    // Edge: A --> B, A -->|label| B, A[...] --> B{...}
    const edgeMatch = line.match(/(\w+)(?:\[.*?\]|\{.*?\}|\(.*?\))?\s*-->\s*(?:\|([^|]*)\|\s*)?(\w+)(?:\[.*?\]|\{.*?\}|\(.*?\))?/);
    if (edgeMatch) {
      const fromId = edgeMatch[1];
      const label = edgeMatch[2] || '';
      const toId = edgeMatch[3];
      if (!nodes.has(fromId)) { nodes.set(fromId, { id: fromId, text: fromId, type: 'rect' }); order.push(fromId); }
      if (!nodes.has(toId)) { nodes.set(toId, { id: toId, text: toId, type: 'rect' }); order.push(toId); }
      edges.push({ from: fromId, to: toId, label });
    }
  }

  if (order.length === 0) return '<p style="color:var(--color-on-surface-variant);">无法解析流程图</p>';

  // Render nodes vertically
  const nodeHtml: string[] = [];
  const nodeSet = new Set(order);
  for (const id of nodeSet) {
    const n = nodes.get(id)!;
    let style = 'display:inline-block;padding:8px 16px;border:2px solid var(--color-primary);background:var(--color-surface);font:var(--text-body-md);text-align:center;min-width:80px;';
    if (n.type === 'diamond') style += 'transform:rotate(45deg);border-radius:4px;min-width:60px;';
    if (n.type === 'rounded') style += 'border-radius:20px;';
    nodeHtml.push(`<div data-fc-node="${n.id}" style="${style}"><span style="${n.type === 'diamond' ? 'display:inline-block;transform:rotate(-45deg);' : ''}">${n.text}</span></div>`);
  }

  // Render arrows between nodes (vertical flow)
  const arrowHtml: string[] = [];
  for (const e of edges) {
    arrowHtml.push(`<div style="display:flex;flex-direction:column;align-items:center;padding:4px 0;">
      <div style="width:2px;height:16px;background:var(--color-primary);"></div>
      <div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:8px solid var(--color-primary);"></div>
      ${e.label ? `<span style="font:var(--text-body-sm);color:var(--color-on-surface-variant);margin:2px 0;">${e.label}</span>` : ''}
      <span style="font:var(--text-label-md);color:var(--color-primary);">${nodes.get(e.to)?.text || e.to}</span>
    </div>`);
  }

  return `<div style="display:flex;flex-direction:column;align-items:center;padding:16px 0;">${nodeHtml.join('')}${arrowHtml.join('')}</div>`;
}

// --- Markdown to HTML ---

function mdToHtml(md: string): string {
  // Extract flow/mermaid code blocks and replace with rendered flowcharts
  let processedMd = md.replace(/```(?:flow|mermaid)\n([\s\S]*?)```/g, (_match, code: string) => {
    return `<div class="flowchart">${renderFlowchart(code)}</div>`;
  });

  let html = processedMd
    // Code blocks (non-flow)
    .replace(/```(\w*)\n([\s\S]*?)```/g, (_m, lang: string, code: string) => {
      const highlighted = highlightCode(code.trimEnd(), lang || 'text');
      return `<pre style="background:var(--color-surface);border:1px solid var(--color-outline-variant);border-radius:var(--radius-md);padding:16px;overflow-x:auto;font-family:var(--font-mono);font-size:13px;line-height:1.5;margin:12px 0;"><code>${highlighted}</code></pre>`;
    })
    // Inline code
    .replace(/`([^`]+)`/g, '<code style="background:var(--color-surface);border:1px solid var(--color-outline-variant);border-radius:4px;padding:2px 6px;font-family:var(--font-mono);font-size:0.9em;">$1</code>')
    // Headings
    .replace(/^######\s+(.+)$/gm, '<h6 style="font:var(--text-headline-sm);margin:20px 0 8px;">$1</h6>')
    .replace(/^#####\s+(.+)$/gm, '<h5 style="font:var(--text-headline-sm);margin:20px 0 8px;">$1</h5>')
    .replace(/^####\s+(.+)$/gm, '<h4 style="font:var(--text-headline-md);margin:20px 0 8px;">$1</h4>')
    .replace(/^###\s+(.+)$/gm, '<h3 style="font:var(--text-headline-md);margin:24px 0 12px;">$1</h3>')
    .replace(/^##\s+(.+)$/gm, '<h2 style="font:var(--text-headline-lg);margin:28px 0 12px;border-bottom:1px solid var(--color-outline-variant);padding-bottom:8px;">$1</h2>')
    .replace(/^#\s+(.+)$/gm, '<h1 style="font:var(--text-headline-lg);margin:32px 0 16px;border-bottom:2px solid var(--color-primary);padding-bottom:8px;">$1</h1>')
    // Bold and italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Strikethrough
    .replace(/~~(.+?)~~/g, '<del>$1</del>')
    // Links and images
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2" style="max-width:100%;border-radius:var(--radius-md);" />')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:var(--color-primary);text-decoration:underline;">$1</a>')
    // Horizontal rule
    .replace(/^---+$/gm, '<hr style="border:none;border-top:1px solid var(--color-outline-variant);margin:24px 0;" />')
    // Unordered list
    .replace(/^[\-\*]\s+(.+)$/gm, '<li data-list="ul">$1</li>')
    // Ordered list
    .replace(/^\d+\.\s+(.+)$/gm, '<li data-list="ol">$1</li>')
    // Blockquote
    .replace(/^>\s+(.+)$/gm, '<blockquote style="border-left:4px solid var(--color-primary);margin:12px 0;padding:8px 16px;color:var(--color-on-surface-variant);background:var(--color-surface);border-radius:0 var(--radius-md) var(--radius-md) 0;">$1</blockquote>')
    // Table rows
    .replace(/^\|(.+)\|$/gm, (_match, content) => {
      if (/^[\s\-:|]+$/.test(content)) return '<tr-sep />';
      const cells = content.split('|').map((c: string) => c.trim());
      return '<tr>' + cells.map((c: string) => `<td style="border:1px solid var(--color-outline-variant);padding:8px 12px;">${c}</td>`).join('') + '</tr>';
    });

  // Post-process: paragraphs, lists, tables
  const lines = html.split('\n');
  const result: string[] = [];
  let inList = false;
  let listType: 'ul' | 'ol' = 'ul';
  let inTable = false;
  let pendingTableRow: string | null = null;
  let sawSeparator = false;

  for (const line of lines) {
    if (line.startsWith('<li')) {
      const lt = line.match(/data-list="(ul|ol)"/)?.[1] as 'ul' | 'ol' ?? 'ul';
      if (!inList || lt !== listType) {
        if (inList) result.push(`</${listType}>`);
        listType = lt;
        result.push(`<${listType} style="padding-left:24px;margin:8px 0;">`);
        inList = true;
      }
      result.push(line.replace(/ data-list="[^"]*"/, '') + '\n');
    } else {
      if (inList) { result.push(`</${listType}>`); inList = false; }
      if (line === '<tr-sep />') {
        sawSeparator = true;
        // The previous <tr> row is the header - convert it
        if (pendingTableRow !== null) {
          result.push(pendingTableRow.replace(/<td>/g, '<th style="border:1px solid var(--color-outline-variant);padding:8px 12px;background:var(--color-surface);font-weight:600;text-align:left;">').replace(/<\/td>/g, '</th>') + '\n');
          pendingTableRow = null;
        }
      } else if (line.startsWith('<tr>')) {
        if (!inTable) { result.push('<table style="border-collapse:collapse;width:100%;margin:16px 0;">'); inTable = true; }
        if (sawSeparator) {
          // This is a data row after the separator
          result.push(line + '\n');
        } else {
          // Buffer this row - it might be the header
          pendingTableRow = line;
        }
      } else {
        if (inTable && !line.startsWith('<tr')) {
          // Flush any pending header row
          if (pendingTableRow !== null) {
            result.push(pendingTableRow + '\n');
            pendingTableRow = null;
          }
          result.push('</table>');
          inTable = false;
          sawSeparator = false;
        }
        if (line.trim() === '') {
          result.push('');
        } else if (line.startsWith('<h') || line.startsWith('<hr') || line.startsWith('<pre') || line.startsWith('<blockquote') || line.startsWith('<img') || line.startsWith('<div class="flowchart"')) {
          result.push(line);
        } else {
          result.push(`<p style="margin:8px 0;line-height:1.8;">${line}</p>`);
        }
      }
    }
  }
  if (pendingTableRow !== null) result.push(pendingTableRow + '\n');
  if (inList) result.push(`</${listType}>`);
  if (inTable) result.push('</table>');

  return result.join('\n');
}

// --- Tool Module ---

let mpDebounceTimer: ReturnType<typeof setTimeout>;

export default {
  id: 'markdown-preview',
  name: 'Markdown 文件预览器',
  icon: 'preview',
  render(container: HTMLElement) {
    container.innerHTML = `
      <div class="content">
        <div class="tool-page-header">
          <a href="#/code" class="tool-page-back">${icon('code')} 代码工具</a>
          <h1 style="font: var(--text-headline-md);">Markdown 文件预览器</h1>
          <p style="font: var(--text-body-md); color: var(--color-on-surface-variant);">Markdown 实时预览，支持代码高亮、表格和流程图</p>
        </div>
        <div class="tool-page-body">
          <div class="tool-field">
            <div id="mp-dropzone" style="border: 2px dashed var(--color-outline-variant); border-radius: var(--radius-lg); padding: 20px; text-align: center; cursor: pointer; transition: border-color 0.2s; margin-bottom: 12px;">
              <div style="color: var(--color-on-surface-variant); margin-bottom: 4px;">${icon('upload', 24)}</div>
              <p style="font: var(--text-body-sm); color: var(--color-on-surface-variant);">拖拽 .md / .txt 文件到这里，或点击选择</p>
              <input type="file" id="mp-file" accept=".md,.txt,text/markdown,text/plain" style="display: none;" />
            </div>
          </div>
          <div class="tool-split">
            <div class="tool-split-pane">
              <div class="tool-field">
                <label class="tool-label">Markdown 编辑</label>
                <textarea id="mp-input" class="tool-textarea" rows="20" placeholder="# 标题&#10;&#10;这是一段 **Markdown** 文本。&#10;&#10;- 列表项 1&#10;- 列表项 2&#10;&#10;> 引用内容&#10;&#10;\`\`\`javascript&#10;const hello = 'world';&#10;\`\`\`&#10;&#10;| 列1 | 列2 |&#10;|-----|-----|&#10;| A   | B   |&#10;&#10;\`\`\`flow&#10;A[开始] --> B{条件判断}&#10;B -->|是| C[执行操作]&#10;B -->|否| D[结束]&#10;\`\`\`" style="font-family: var(--font-mono); font-size: 13px;"></textarea>
              </div>
            </div>
            <div class="tool-split-pane">
              <div class="tool-field">
                <label class="tool-label">实时预览</label>
                <div id="mp-output" class="tool-output" style="min-height: 300px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.8; padding: 24px; border: 1px solid var(--color-outline-variant); border-radius: var(--radius-md); background: var(--color-surface); overflow-y: auto;">
                  <span style="color: var(--color-on-surface-variant); opacity: 0.5;">在左侧输入 Markdown 即可实时预览</span>
                </div>
              </div>
            </div>
          </div>
          <div class="tool-actions">
            <button class="btn btn-ghost" id="mp-copy-html">${icon('clipboard')} 复制 HTML</button>
            <button class="btn btn-secondary" id="mp-clear">清空</button>
          </div>
        </div>
      </div>
    `;

    const input = container.querySelector('#mp-input') as HTMLTextAreaElement;
    const output = container.querySelector('#mp-output') as HTMLElement;
    const dropzone = container.querySelector('#mp-dropzone') as HTMLElement;
    const fileInput = container.querySelector('#mp-file') as HTMLInputElement;

    function doPreview() {
      const text = input.value;
      if (!text.trim()) {
        output.innerHTML = '<span style="color: var(--color-on-surface-variant); opacity: 0.5;">在左侧输入 Markdown 即可实时预览</span>';
        return;
      }
      output.innerHTML = mdToHtml(text);
    }

    input.addEventListener('input', () => {
      clearTimeout(mpDebounceTimer);
      mpDebounceTimer = setTimeout(doPreview, 200);
    });

    // File drag-drop
    dropzone.addEventListener('click', () => fileInput.click());
    dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.style.borderColor = 'var(--color-primary)'; });
    dropzone.addEventListener('dragleave', () => { dropzone.style.borderColor = 'var(--color-outline-variant)'; });
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.style.borderColor = 'var(--color-outline-variant)';
      const file = e.dataTransfer?.files[0];
      if (file) readFile(file);
    });
    fileInput.addEventListener('change', () => { if (fileInput.files?.[0]) readFile(fileInput.files[0]); });

    function readFile(file: File) {
      const reader = new FileReader();
      reader.onload = () => { input.value = reader.result as string; doPreview(); };
      reader.readAsText(file);
    }

    container.querySelector('#mp-copy-html')!.addEventListener('click', () => {
      const text = input.value;
      if (text.trim()) navigator.clipboard.writeText(mdToHtml(text));
    });

    container.querySelector('#mp-clear')!.addEventListener('click', () => {
      input.value = '';
      output.innerHTML = '<span style="color: var(--color-on-surface-variant); opacity: 0.5;">在左侧输入 Markdown 即可实时预览</span>';
    });
  },
  destroy() { clearTimeout(mpDebounceTimer); },
};
