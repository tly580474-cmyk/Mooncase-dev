export interface GifFrame {
  data: Uint8ClampedArray;
  width: number;
  height: number;
  delay: number;
}

export interface GifOptions {
  width: number;
  height: number;
  loop: number;
}

// Median-cut color quantization
function quantize(pixels: Uint8ClampedArray, maxColors: number): { palette: Uint8Array; indexed: Uint8Array } {
  const pixelCount = pixels.length / 4;
  // Collect RGB pixels
  const rgb: number[][] = [];
  for (let i = 0; i < pixels.length; i += 4) {
    rgb.push([pixels[i], pixels[i + 1], pixels[i + 2]]);
  }

  interface Box {
    pixels: number[][];
    rMin: number; rMax: number;
    gMin: number; gMax: number;
    bMin: number; bMax: number;
  }

  function createBox(px: number[][]): Box {
    let rMin = 255, rMax = 0, gMin = 255, gMax = 0, bMin = 255, bMax = 0;
    for (const p of px) {
      if (p[0] < rMin) rMin = p[0]; if (p[0] > rMax) rMax = p[0];
      if (p[1] < gMin) gMin = p[1]; if (p[1] > gMax) gMax = p[1];
      if (p[2] < bMin) bMin = p[2]; if (p[2] > bMax) bMax = p[2];
    }
    return { pixels: px, rMin, rMax, gMin, gMax, bMin, bMax };
  }

  function longestAxis(b: Box): 'r' | 'g' | 'b' {
    const rRange = b.rMax - b.rMin;
    const gRange = b.gMax - b.gMin;
    const bRange = b.bMax - b.bMin;
    if (rRange >= gRange && rRange >= bRange) return 'r';
    if (gRange >= rRange && gRange >= bRange) return 'g';
    return 'b';
  }

  const axisIdx = { r: 0, g: 1, b: 2 };
  let boxes: Box[] = [createBox(rgb)];

  while (boxes.length < maxColors) {
    // Find box with most pixels to split
    let maxIdx = 0;
    let maxCount = 0;
    for (let i = 0; i < boxes.length; i++) {
      if (boxes[i].pixels.length > maxCount) {
        maxCount = boxes[i].pixels.length;
        maxIdx = i;
      }
    }
    if (maxCount <= 1) break;

    const box = boxes[maxIdx];
    const axis = longestAxis(box);
    const idx = axisIdx[axis];
    box.pixels.sort((a, b) => a[idx] - b[idx]);
    const mid = Math.floor(box.pixels.length / 2);
    const left = box.pixels.slice(0, mid);
    const right = box.pixels.slice(mid);
    boxes.splice(maxIdx, 1, createBox(left), createBox(right));
  }

  // Build palette
  const palette = new Uint8Array(maxColors * 3);
  const paletteColors: number[][] = [];
  for (let i = 0; i < boxes.length; i++) {
    const b = boxes[i];
    let rSum = 0, gSum = 0, bSum = 0;
    for (const p of b.pixels) {
      rSum += p[0]; gSum += p[1]; bSum += p[2];
    }
    const n = b.pixels.length || 1;
    const color = [Math.round(rSum / n), Math.round(gSum / n), Math.round(bSum / n)];
    paletteColors.push(color);
    palette[i * 3] = color[0];
    palette[i * 3 + 1] = color[1];
    palette[i * 3 + 2] = color[2];
  }

  // Map pixels to nearest palette entry
  const indexed = new Uint8Array(pixelCount);
  for (let i = 0; i < pixelCount; i++) {
    const r = pixels[i * 4];
    const g = pixels[i * 4 + 1];
    const b = pixels[i * 4 + 2];
    let bestIdx = 0;
    let bestDist = Infinity;
    for (let j = 0; j < paletteColors.length; j++) {
      const c = paletteColors[j];
      const dr = r - c[0], dg = g - c[1], db = b - c[2];
      const dist = dr * dr + dg * dg + db * db;
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = j;
        if (dist === 0) break;
      }
    }
    indexed[i] = bestIdx;
  }

  return { palette, indexed };
}

// LZW compression for GIF
function lzwEncode(indexed: Uint8Array, minCodeSize: number): Uint8Array {
  const clearCode = 1 << minCodeSize;
  const eoiCode = clearCode + 1;

  const output: number[] = [];
  let curByte = 0;
  let bitPos = 0;
  let codeSize = minCodeSize + 1;
  let nextCode = eoiCode + 1;

  // Code table: string key -> code
  const codeTable = new Map<string, number>();

  function resetTable() {
    codeTable.clear();
    for (let i = 0; i < clearCode; i++) {
      codeTable.set(String(i), i);
    }
    nextCode = eoiCode + 1;
    codeSize = minCodeSize + 1;
  }

  function writeBits(code: number, bits: number) {
    curByte |= (code << bitPos);
    bitPos += bits;
    while (bitPos >= 8) {
      output.push(curByte & 0xff);
      curByte >>= 8;
      bitPos -= 8;
    }
  }

  resetTable();
  writeBits(clearCode, codeSize);

  let current = String(indexed[0]);
  for (let i = 1; i < indexed.length; i++) {
    const next = indexed[i];
    const combined = current + ',' + next;
    if (codeTable.has(combined)) {
      current = combined;
    } else {
      writeBits(codeTable.get(current)!, codeSize);
      if (nextCode < 4096) {
        codeTable.set(combined, nextCode);
        if (nextCode >= (1 << codeSize)) {
          codeSize++;
        }
        nextCode++;
      } else {
        writeBits(clearCode, codeSize);
        resetTable();
      }
      current = String(next);
    }
  }

  writeBits(codeTable.get(current)!, codeSize);
  writeBits(eoiCode, codeSize);

  if (bitPos > 0) {
    output.push(curByte & 0xff);
  }

  return new Uint8Array(output);
}

// Assemble GIF87a binary
export function encodeGif(frames: GifFrame[], options: GifOptions): Uint8Array {
  const { width, height, loop } = options;
  const parts: Uint8Array[] = [];
  const te = new TextEncoder();

  function pushBytes(...arrays: Uint8Array[]) {
    for (const a of arrays) parts.push(a);
  }

  function pushByte(b: number) {
    parts.push(new Uint8Array([b]));
  }

  function pushLE16(v: number) {
    parts.push(new Uint8Array([v & 0xff, (v >> 8) & 0xff]));
  }

  // Header
  pushBytes(te.encode('GIF89a'));

  // Logical Screen Descriptor
  pushLE16(width);
  pushLE16(height);
  pushByte(0x70); // packed: no GCT, color res 8
  pushByte(0);    // bg color
  pushByte(0);    // pixel aspect

  // Netscape Application Extension (for looping)
  pushByte(0x21); // extension
  pushByte(0xff); // app ext
  pushByte(11);   // block size
  pushBytes(te.encode('NETSCAPE2.0'));
  pushByte(3);    // sub-block size
  pushByte(1);
  pushLE16(loop);
  pushByte(0);    // block terminator

  for (const frame of frames) {
    const { palette, indexed } = quantize(frame.data, 256);
    const minCodeSize = 8;
    const compressed = lzwEncode(indexed, minCodeSize);

    // Graphic Control Extension
    pushByte(0x21);
    pushByte(0xf9);
    pushByte(4);
    pushByte(0x00); // disposal: none, no transparency
    pushLE16(Math.round(frame.delay / 10)); // delay in centiseconds
    pushByte(0);    // transparent color index
    pushByte(0);    // block terminator

    // Image Descriptor
    pushByte(0x2c);
    pushLE16(0);    // left
    pushLE16(0);    // top
    pushLE16(width);
    pushLE16(height);
    pushByte(0x87); // packed: local color table, 256 colors

    // Local Color Table
    pushBytes(palette);

    // LZW Minimum Code Size
    pushByte(minCodeSize);

    // Sub-blocks of compressed data
    let offset = 0;
    while (offset < compressed.length) {
      const chunkSize = Math.min(255, compressed.length - offset);
      pushByte(chunkSize);
      pushBytes(compressed.slice(offset, offset + chunkSize));
      offset += chunkSize;
    }
    pushByte(0); // block terminator
  }

  // Trailer
  pushByte(0x3b);

  // Concatenate all parts
  let totalLen = 0;
  for (const p of parts) totalLen += p.length;
  const result = new Uint8Array(totalLen);
  let pos = 0;
  for (const p of parts) {
    result.set(p, pos);
    pos += p.length;
  }
  return result;
}
