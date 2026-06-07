import { icon } from '../../core/icons';

export default {
  id: 'find-ping',
  name: 'FindPing',
  icon: 'compass',
  render(container: HTMLElement) {
    container.innerHTML = `
      <div class="content">
        <div class="tool-page-header">
          <a href="#/network" class="tool-page-back">${icon('language')} 网络诊断</a>
          <h1 style="font: var(--text-headline-md);">FindPing</h1>
          <p style="font: var(--text-body-md); color: var(--color-on-surface-variant);">查找最近的 Ping 服务器</p>
        </div>
        <div class="tool-page-body">
          <div style="padding:32px;text-align:center;">
            <div style="margin-bottom:24px;color:var(--color-on-surface-variant);font:var(--text-body-lg);">
              将跳转到 ITDOG FindPing 工具
            </div>
            <a href="https://www.itdog.cn/find_ping/" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="display:inline-flex;align-items:center;gap:8px;text-decoration:none;padding:12px 32px;font:var(--text-label-lg);">
              ${icon('compass')} 打开 FindPing
            </a>
            <div style="margin-top:16px;color:var(--color-on-surface-variant);font:var(--text-body-sm);">
              itdog.cn/find_ping
            </div>
          </div>
        </div>
      </div>
    `;
  },
};
