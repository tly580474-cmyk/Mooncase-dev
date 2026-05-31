import { icon } from '../../core/icons';

const TARGET_URL = 'https://tool.hoothin.com/zh-CN/image-upscaler';

export default {
  id: 'image-upscale',
  name: 'AI图片超分辨率',
  icon: 'wand',

  render(container: HTMLElement) {
    window.open(TARGET_URL, '_blank');

    container.innerHTML = `
      <div class="content" style="max-width:100%; text-align:center; padding-top:80px;">
        ${icon('wand', 48)}
        <h1 style="font: var(--text-headline-md); margin-top:16px;">AI 图片超分辨率</h1>
        <p style="font: var(--text-body-md); color: var(--color-on-surface-variant); margin-top:8px;">
          已在新标签页打开外部工具
        </p>
        <p style="font: var(--text-body-sm); color: var(--color-on-surface-variant); margin-top:16px;">
          如未自动打开，请点击下方链接：
        </p>
        <a href="${TARGET_URL}" target="_blank" rel="noopener" class="btn btn-primary" style="margin-top:12px; display:inline-flex; align-items:center; gap:6px;">
          ${icon('link', 16)} 前往 AI 图片超分辨率
        </a>
      </div>
    `;
  },

  destroy() {},
};
