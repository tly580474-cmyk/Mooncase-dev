import { icon } from '../../core/icons';

interface ImageItem {
  file: File;
  url: string;
  width: number;
  height: number;
  jpegData: ArrayBuffer;
}

export default {
  id: 'image-to-pdf',
  name: '图片转PDF',
  icon: 'file_image',
  render(container: HTMLElement) {
    container.innerHTML = `
      <div class="content">
        <div class="tool-page-header">
          <a href="#/image" class="tool-page-back">${icon('image')} 图片工具</a>
          <h1 style="font: var(--text-headline-md);">图片转PDF</h1>
          <p style="font: var(--text-body-md); color: var(--color-on-surface-variant);">将多张图片合并为PDF文件，支持拖拽排序</p>
        </div>
        <div class="tool-page-body">
          <div class="tool-field">
            <div id="pdf-dropzone" style="border: 2px dashed var(--color-outline-variant); border-radius: var(--radius-lg); padding: 48px; text-align: center; cursor: pointer;">
              <div style="color: var(--color-on-surface-variant); margin-bottom: 12px;">${icon('upload', 36)}</div>
              <p style="font: var(--text-body-lg); color: var(--color-on-surface-variant);">拖拽图片到这里，或点击选择</p>
              <p style="font: var(--text-label-md); color: var(--color-outline); margin-top: 8px;">支持 JPG / PNG / WebP，可多选</p>
              <input type="file" id="pdf-file" accept="image/*" multiple style="display: none;" />
            </div>
          </div>
          <div id="pdf-thumbnails" style="display: flex; flex-wrap: wrap; gap: 12px; margin: 16px 0;"></div>
          <div id="pdf-settings" style="display: none;">
            <div class="tool-field">
              <label class="tool-label">页面大小</label>
              <select id="pdf-page-size" class="tool-input" style="max-width: 200px;">
                <option value="a4">A4 (210 x 297 mm)</option>
                <option value="letter">Letter (8.5 x 11 in)</option>
                <option value="fit">自适应图片</option>
              </select>
            </div>
            <div class="tool-field">
              <label class="tool-label">方向</label>
              <select id="pdf-orientation" class="tool-input" style="max-width: 200px;">
                <option value="portrait">纵向</option>
                <option value="landscape">横向</option>
                <option value="auto">自动</option>
              </select>
            </div>
            <div class="tool-actions">
              <button class="btn btn-primary" id="pdf-generate">${icon('download')} 生成 PDF</button>
            </div>
          </div>
        </div>
      </div>
    `;

    const dropzone = container.querySelector('#pdf-dropzone') as HTMLElement;
    const fileInput = container.querySelector('#pdf-file') as HTMLInputElement;
    const thumbContainer = container.querySelector('#pdf-thumbnails') as HTMLElement;
    const settings = container.querySelector('#pdf-settings') as HTMLElement;

    const images: ImageItem[] = [];
    let dragIdx = -1;

    function renderThumbs() {
      thumbContainer.innerHTML = '';
      images.forEach((img, i) => {
        const div = document.createElement('div');
        div.style.cssText = 'position: relative; width: 100px; height: 100px; border-radius: var(--radius-md); overflow: hidden; border: 1px solid var(--color-outline-variant); cursor: grab;';
        div.draggable = true;
        div.innerHTML = `
          <img src="${img.url}" style="width: 100%; height: 100%; object-fit: cover;" />
          <div style="position: absolute; top: 4px; right: 4px; width: 20px; height: 20px; background: rgba(0,0,0,0.6); color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 12px;" data-remove="${i}">&times;</div>
          <div style="position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.5); color: #fff; font-size: 10px; text-align: center; padding: 2px;">${i + 1}</div>
        `;
        div.addEventListener('dragstart', () => { dragIdx = i; });
        div.addEventListener('dragover', (e) => { e.preventDefault(); div.style.opacity = '0.5'; });
        div.addEventListener('dragleave', () => { div.style.opacity = '1'; });
        div.addEventListener('drop', (e) => {
          e.preventDefault();
          div.style.opacity = '1';
          if (dragIdx >= 0 && dragIdx !== i) {
            const [moved] = images.splice(dragIdx, 1);
            images.splice(i, 0, moved);
            renderThumbs();
          }
        });
        div.addEventListener('dragend', () => { dragIdx = -1; });
        thumbContainer.appendChild(div);
      });

      thumbContainer.querySelectorAll('[data-remove]').forEach(el => {
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          const idx = parseInt(el.getAttribute('data-remove')!);
          URL.revokeObjectURL(images[idx].url);
          images.splice(idx, 1);
          renderThumbs();
        });
      });

      settings.style.display = images.length > 0 ? 'block' : 'none';
    }

    async function addFiles(files: FileList | File[]) {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) continue;
        const url = URL.createObjectURL(file);
        const dims = await getImageDimensions(file);
        const jpegData = await getJpegData(file);
        images.push({ file, url, width: dims.width, height: dims.height, jpegData });
      }
      renderThumbs();
    }

    function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
      return new Promise((resolve) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => { resolve({ width: img.width, height: img.height }); URL.revokeObjectURL(url); };
        img.onerror = () => { URL.revokeObjectURL(url); resolve({ width: 800, height: 600 }); };
        img.src = url;
      });
    }

    function getJpegData(file: File): Promise<ArrayBuffer> {
      return new Promise((resolve) => {
        if (file.type === 'image/jpeg') {
          file.arrayBuffer().then(resolve);
        } else {
          const img = new Image();
          const url = URL.createObjectURL(file);
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d')!;
            ctx.fillStyle = '#fff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            canvas.toBlob((blob) => {
              if (blob) blob.arrayBuffer().then(resolve);
              else resolve(new ArrayBuffer(0));
              URL.revokeObjectURL(url);
            }, 'image/jpeg', 0.92);
          };
          img.onerror = () => { URL.revokeObjectURL(url); resolve(new ArrayBuffer(0)); };
          img.src = url;
        }
      });
    }

    dropzone.addEventListener('click', () => fileInput.click());
    dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.style.borderColor = 'var(--color-primary)'; });
    dropzone.addEventListener('dragleave', () => { dropzone.style.borderColor = 'var(--color-outline-variant)'; });
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.style.borderColor = 'var(--color-outline-variant)';
      if (e.dataTransfer?.files.length) addFiles(e.dataTransfer.files);
    });
    fileInput.addEventListener('change', () => {
      if (fileInput.files?.length) addFiles(fileInput.files);
    });

    container.querySelector('#pdf-generate')!.addEventListener('click', () => {
      if (images.length === 0) return;

      const pageSize = (container.querySelector('#pdf-page-size') as HTMLSelectElement).value;
      const orientation = (container.querySelector('#pdf-orientation') as HTMLSelectElement).value;

      const PAGE_SIZES: Record<string, [number, number]> = {
        a4: [595.28, 841.89],
        letter: [612, 792],
      };

      interface PageInfo {
        pageW: number;
        pageH: number;
        jpegData: ArrayBuffer;
        imgW: number;
        imgH: number;
        drawX: number;
        drawY: number;
        drawW: number;
        drawH: number;
      }

      const pages: PageInfo[] = [];

      for (const img of images) {
        let pageW: number, pageH: number;

        if (pageSize === 'fit') {
          pageW = img.width;
          pageH = img.height;
        } else {
          let [pw, ph] = PAGE_SIZES[pageSize];
          const isLandscape = orientation === 'landscape' || (orientation === 'auto' && img.width > img.height);
          if (isLandscape) [pw, ph] = [ph, pw];
          pageW = pw;
          pageH = ph;
        }

        const scale = Math.min(pageW / img.width, pageH / img.height);
        const drawW = img.width * scale;
        const drawH = img.height * scale;
        const drawX = (pageW - drawW) / 2;
        const drawY = (pageH - drawH) / 2;

        pages.push({ pageW, pageH, jpegData: img.jpegData, imgW: img.width, imgH: img.height, drawX, drawY, drawW, drawH });
      }

      const pdfBytes = buildPdf(pages);
      const blob = new Blob([pdfBytes.buffer.slice(0) as ArrayBuffer], { type: 'application/pdf' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'images.pdf';
      a.click();
      URL.revokeObjectURL(a.href);
    });
  },
};

function buildPdf(pages: { pageW: number; pageH: number; jpegData: ArrayBuffer; imgW: number; imgH: number; drawX: number; drawY: number; drawW: number; drawH: number }[]): Uint8Array {
  const enc = new TextEncoder();
  const parts: { bytes: Uint8Array; len: number }[] = [];
  let totalLen = 0;

  function writeStr(s: string) {
    const b = enc.encode(s);
    parts.push({ bytes: b, len: b.length });
    totalLen += b.length;
  }

  function writeBytes(b: Uint8Array) {
    parts.push({ bytes: b, len: b.length });
    totalLen += b.length;
  }

  const N = pages.length;

  // Object layout:
  // 1: Catalog
  // 2: Pages
  // For each page i (0..N-1):
  //   3 + 3i: Page
  //   4 + 3i: Content Stream
  //   5 + 3i: Image XObject
  const totalObjs = 2 + 3 * N;
  const objOffsets: number[] = [];

  function startObj(num: number) {
    objOffsets[num] = totalLen;
    writeStr(`${num} 0 obj\n`);
  }

  // Header
  writeStr('%PDF-1.4\n');

  // Object 1: Catalog
  startObj(1);
  writeStr('<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');

  // Object 2: Pages
  startObj(2);
  const kids = Array.from({ length: N }, (_, i) => `${3 + 3 * i} 0 R`).join(' ');
  writeStr(`<< /Type /Pages /Kids [${kids}] /Count ${N} >>\nendobj\n`);

  // Each page
  for (let i = 0; i < N; i++) {
    const p = pages[i];
    const pageObj = 3 + 3 * i;
    const contentObj = 4 + 3 * i;
    const imageObj = 5 + 3 * i;

    // Page object
    startObj(pageObj);
    writeStr(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${p.pageW.toFixed(2)} ${p.pageH.toFixed(2)}] `);
    writeStr(`/Contents ${contentObj} 0 R /Resources << /XObject << /Im0 ${imageObj} 0 R >> >> >>\nendobj\n`);

    // Content stream: place image on page
    // PDF coordinate: origin at bottom-left, y goes up
    const content = `q\n${p.drawW.toFixed(2)} 0 0 ${p.drawH.toFixed(2)} ${p.drawX.toFixed(2)} ${p.drawY.toFixed(2)} cm\n/Im0 Do\nQ\n`;
    const contentBytes = enc.encode(content);
    startObj(contentObj);
    writeStr(`<< /Length ${contentBytes.length} >>\nstream\n`);
    writeBytes(contentBytes);
    writeStr('\nendstream\nendobj\n');

    // Image XObject (JPEG)
    const jpegBytes = new Uint8Array(p.jpegData);
    startObj(imageObj);
    writeStr(`<< /Type /XObject /Subtype /Image /Width ${p.imgW} /Height ${p.imgH} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`);
    writeBytes(jpegBytes);
    writeStr('\nendstream\nendobj\n');
  }

  // Cross-reference table
  const xrefOffset = totalLen;
  writeStr(`xref\n0 ${totalObjs + 1}\n`);
  writeStr('0000000000 65535 f \n');
  for (let i = 1; i <= totalObjs; i++) {
    writeStr(String(objOffsets[i]).padStart(10, '0') + ' 00000 n \n');
  }

  // Trailer
  writeStr(`trailer\n<< /Size ${totalObjs + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`);

  // Concatenate
  const result = new Uint8Array(totalLen);
  let pos = 0;
  for (const p of parts) {
    result.set(p.bytes, pos);
    pos += p.len;
  }
  return result;
}
