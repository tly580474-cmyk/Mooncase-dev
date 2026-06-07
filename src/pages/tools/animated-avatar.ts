import { icon } from '../../core/icons';
import { encodeGif, type GifFrame } from '../../core/gif-encoder';

type Effect = 'rotate' | 'bounce' | 'pulse' | 'glow' | 'shake' | 'rainbow';

const EFFECTS: { id: Effect; name: string }[] = [
  { id: 'rotate', name: '旋转' },
  { id: 'bounce', name: '弹跳' },
  { id: 'pulse', name: '脉冲' },
  { id: 'glow', name: '发光' },
  { id: 'shake', name: '抖动' },
  { id: 'rainbow', name: '彩虹边框' },
];

export default {
  id: 'animated-avatar',
  name: '动态头像生成器',
  icon: 'sparkles',
  render(container: HTMLElement) {
    container.innerHTML = `
      <div class="content">
        <div class="tool-page-header">
          <a href="#/image" class="tool-page-back">${icon('image')} 图片处理</a>
          <h1 style="font: var(--text-headline-md);">动态头像生成器</h1>
          <p style="font: var(--text-body-md); color: var(--color-on-surface-variant);">为头像添加动画效果，导出GIF或复制CSS代码</p>
        </div>
        <div class="tool-page-body">
          <div class="tool-field">
            <div id="av-dropzone" style="border: 2px dashed var(--color-outline-variant); border-radius: var(--radius-lg); padding: 48px; text-align: center; cursor: pointer;">
              <div style="color: var(--color-on-surface-variant); margin-bottom: 12px;">${icon('upload', 36)}</div>
              <p style="font: var(--text-body-lg); color: var(--color-on-surface-variant);">拖拽头像图片到这里，或点击选择</p>
              <input type="file" id="av-file" accept="image/*" style="display: none;" />
            </div>
          </div>
          <div id="av-workspace" style="display: none;">
            <div class="tool-field">
              <label class="tool-label">选择动画效果</label>
              <div id="av-effects" style="display: flex; flex-wrap: wrap; gap: 8px;">
                ${EFFECTS.map(e => `
                  <label style="display: flex; align-items: center; gap: 6px; padding: 8px 16px; border: 1px solid var(--color-outline-variant); border-radius: var(--radius-md); cursor: pointer; transition: all var(--transition-fast);">
                    <input type="radio" name="av-effect" value="${e.id}" ${e.id === 'rotate' ? 'checked' : ''} style="accent-color: var(--color-primary);" />
                    ${e.name}
                  </label>
                `).join('')}
              </div>
            </div>
            <div class="tool-field">
              <label class="tool-label">动画速度: <span id="av-speed-val">5</span></label>
              <input type="range" id="av-speed" min="1" max="10" value="5" style="width: 100%; accent-color: var(--color-primary);" />
            </div>
            <div style="display: flex; justify-content: center; padding: 24px;">
              <div id="av-preview-wrapper" style="width: 200px; height: 200px; border-radius: 50%; overflow: hidden;">
                <img id="av-preview" style="width: 100%; height: 100%; object-fit: cover;" />
              </div>
            </div>
            <div class="tool-actions" style="justify-content: center; flex-wrap: wrap;">
              <button class="btn btn-ghost" id="av-copy-css">${icon('clipboard')} 复制 CSS 代码</button>
              <button class="btn btn-primary" id="av-export-gif">${icon('download')} 导出 GIF</button>
            </div>
            <div id="av-status" style="display: none; text-align: center; margin-top: 12px;">
              <span id="av-status-text" style="font: var(--text-body-sm); color: var(--color-on-surface-variant);"></span>
            </div>
          </div>
        </div>
      </div>
      <style id="av-keyframes-style"></style>
    `;

    const dropzone = container.querySelector('#av-dropzone') as HTMLElement;
    const fileInput = container.querySelector('#av-file') as HTMLInputElement;
    const workspace = container.querySelector('#av-workspace') as HTMLElement;
    const preview = container.querySelector('#av-preview') as HTMLImageElement;
    const previewWrapper = container.querySelector('#av-preview-wrapper') as HTMLElement;
    const speedEl = container.querySelector('#av-speed') as HTMLInputElement;
    const speedVal = container.querySelector('#av-speed-val') as HTMLElement;
    const styleEl = container.querySelector('#av-keyframes-style') as HTMLStyleElement;
    const statusArea = container.querySelector('#av-status') as HTMLElement;
    const statusText = container.querySelector('#av-status-text') as HTMLElement;

    let currentFile: File | null = null;
    let currentUrl: string | null = null;

    function getSelectedEffect(): Effect {
      const checked = container.querySelector('input[name="av-effect"]:checked') as HTMLInputElement;
      return (checked?.value as Effect) || 'rotate';
    }

    function updateAnimation() {
      const effect = getSelectedEffect();
      const speed = parseInt(speedEl.value);
      const duration = Math.max(0.5, 4 - speed * 0.3);

      let keyframes = '';
      let animation = '';
      let wrapperStyle = '';

      switch (effect) {
        case 'rotate':
          keyframes = `@keyframes av-effect { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`;
          animation = `animation: av-effect ${duration}s linear infinite;`;
          break;
        case 'bounce':
          keyframes = `@keyframes av-effect { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }`;
          animation = `animation: av-effect ${duration}s ease-in-out infinite;`;
          break;
        case 'pulse':
          keyframes = `@keyframes av-effect { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }`;
          animation = `animation: av-effect ${duration}s ease-in-out infinite;`;
          break;
        case 'glow':
          keyframes = `@keyframes av-effect { 0%, 100% { box-shadow: 0 0 5px rgba(99, 102, 241, 0.4); } 50% { box-shadow: 0 0 30px rgba(99, 102, 241, 0.8), 0 0 60px rgba(99, 102, 241, 0.4); } }`;
          animation = `animation: av-effect ${duration}s ease-in-out infinite;`;
          wrapperStyle = `border-radius: 50%;`;
          break;
        case 'shake':
          keyframes = `@keyframes av-effect { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }`;
          animation = `animation: av-effect ${duration * 0.3}s ease-in-out infinite;`;
          break;
        case 'rainbow':
          keyframes = `@keyframes av-effect { 0% { filter: hue-rotate(0deg); } 100% { filter: hue-rotate(360deg); } }`;
          animation = `animation: av-effect ${duration}s linear infinite;`;
          break;
      }

      styleEl.textContent = keyframes;
      preview.style.cssText = `width: 100%; height: 100%; object-fit: cover; ${animation}`;
      if (wrapperStyle) {
        previewWrapper.style.cssText = `width: 200px; height: 200px; overflow: hidden; ${wrapperStyle}`;
      } else {
        previewWrapper.style.cssText = 'width: 200px; height: 200px; border-radius: 50%; overflow: hidden;';
      }
    }

    function loadFile(file: File) {
      if (currentUrl) URL.revokeObjectURL(currentUrl);
      currentFile = file;
      currentUrl = URL.createObjectURL(file);
      preview.src = currentUrl;
      workspace.style.display = 'block';
      updateAnimation();
    }

    dropzone.addEventListener('click', () => fileInput.click());
    dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.style.borderColor = 'var(--color-primary)'; });
    dropzone.addEventListener('dragleave', () => { dropzone.style.borderColor = 'var(--color-outline-variant)'; });
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.style.borderColor = 'var(--color-outline-variant)';
      const file = e.dataTransfer?.files[0];
      if (file && file.type.startsWith('image/')) loadFile(file);
    });
    fileInput.addEventListener('change', () => {
      const file = fileInput.files?.[0];
      if (file) loadFile(file);
    });

    container.querySelectorAll('input[name="av-effect"]').forEach(radio => {
      radio.addEventListener('change', updateAnimation);
    });
    speedEl.addEventListener('input', () => {
      speedVal.textContent = speedEl.value;
      updateAnimation();
    });

    // Copy CSS
    container.querySelector('#av-copy-css')!.addEventListener('click', () => {
      const effect = getSelectedEffect();
      const speed = parseInt(speedEl.value);
      const duration = Math.max(0.5, 4 - speed * 0.3);

      let keyframeContent = '';
      let extraProps = '';

      switch (effect) {
        case 'rotate':
          keyframeContent = `from { transform: rotate(0deg); }\n  to { transform: rotate(360deg); }`;
          break;
        case 'bounce':
          keyframeContent = `0%, 100% { transform: translateY(0); }\n  50% { transform: translateY(-20px); }`;
          break;
        case 'pulse':
          keyframeContent = `0%, 100% { transform: scale(1); }\n  50% { transform: scale(1.1); }`;
          break;
        case 'glow':
          keyframeContent = `0%, 100% { box-shadow: 0 0 5px rgba(99, 102, 241, 0.4); }\n  50% { box-shadow: 0 0 30px rgba(99, 102, 241, 0.8), 0 0 60px rgba(99, 102, 241, 0.4); }`;
          break;
        case 'shake':
          keyframeContent = `0%, 100% { transform: translateX(0); }\n  25% { transform: translateX(-5px); }\n  75% { transform: translateX(5px); }`;
          break;
        case 'rainbow':
          keyframeContent = `0% { filter: hue-rotate(0deg); }\n  100% { filter: hue-rotate(360deg); }`;
          break;
      }

      const css = `.animated-avatar {\n  width: 200px;\n  height: 200px;\n  border-radius: 50%;\n  overflow: hidden;\n  animation: avatar-${effect} ${duration}s ${effect === 'rotate' || effect === 'rainbow' ? 'linear' : 'ease-in-out'} infinite;\n${extraProps}}\n\n.animated-avatar img {\n  width: 100%;\n  height: 100%;\n  object-fit: cover;\n}\n\n@keyframes avatar-${effect} {\n  ${keyframeContent}\n}`;

      navigator.clipboard.writeText(css);
    });

    // Export GIF
    container.querySelector('#av-export-gif')!.addEventListener('click', async () => {
      if (!currentFile) return;

      statusArea.style.display = 'block';
      statusText.textContent = '正在生成GIF帧...';

      const effect = getSelectedEffect();
      const speed = parseInt(speedEl.value);
      const duration = Math.max(0.5, 4 - speed * 0.3);
      const frameCount = 20;
      const size = 200;

      const img = new Image();
      const imgUrl = URL.createObjectURL(currentFile);
      await new Promise<void>(resolve => { img.onload = () => resolve(); img.src = imgUrl; });

      const gifFrames: GifFrame[] = [];

      for (let i = 0; i < frameCount; i++) {
        const t = i / frameCount;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d')!;

        ctx.save();
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.clip();

        switch (effect) {
          case 'rotate': {
            ctx.translate(size / 2, size / 2);
            ctx.rotate(t * Math.PI * 2);
            ctx.drawImage(img, -size / 2, -size / 2, size, size);
            break;
          }
          case 'bounce': {
            const yOff = -Math.sin(t * Math.PI * 2) * 20;
            ctx.drawImage(img, 0, yOff, size, size);
            break;
          }
          case 'pulse': {
            const s = 1 + Math.sin(t * Math.PI * 2) * 0.1;
            ctx.translate(size / 2, size / 2);
            ctx.scale(s, s);
            ctx.drawImage(img, -size / 2, -size / 2, size, size);
            break;
          }
          case 'glow': {
            const blur = 5 + Math.sin(t * Math.PI * 2) * 25;
            ctx.shadowColor = 'rgba(99, 102, 241, 0.8)';
            ctx.shadowBlur = blur;
            ctx.drawImage(img, 0, 0, size, size);
            ctx.shadowBlur = 0;
            break;
          }
          case 'shake': {
            const xOff = Math.sin(t * Math.PI * 4) * 5;
            ctx.drawImage(img, xOff, 0, size, size);
            break;
          }
          case 'rainbow': {
            ctx.filter = `hue-rotate(${t * 360}deg)`;
            ctx.drawImage(img, 0, 0, size, size);
            ctx.filter = 'none';
            break;
          }
        }

        ctx.restore();

        const imageData = ctx.getImageData(0, 0, size, size);
        gifFrames.push({
          data: imageData.data,
          width: size,
          height: size,
          delay: Math.round(duration * 100 / frameCount),
        });

        await new Promise(r => setTimeout(r, 0));
      }

      statusText.textContent = '正在编码GIF...';
      await new Promise(r => setTimeout(r, 0));

      const gifBytes = encodeGif(gifFrames, { width: size, height: size, loop: 0 });

      statusText.textContent = '完成！';
      const blob = new Blob([gifBytes.buffer.slice(0) as ArrayBuffer], { type: 'image/gif' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `avatar-${effect}.gif`;
      a.click();
      URL.revokeObjectURL(a.href);
      URL.revokeObjectURL(imgUrl);

      setTimeout(() => { statusArea.style.display = 'none'; }, 2000);
    });
  },
};
