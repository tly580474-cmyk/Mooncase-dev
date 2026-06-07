import { icon } from '../../core/icons';

export default {
  id: 'online-ping',
  name: '在线 Ping',
  icon: 'send',
  render(container: HTMLElement) {
    container.innerHTML = `
      <div class="content">
        <div class="tool-page-header">
          <a href="#/network" class="tool-page-back">${icon('language')} 网络诊断</a>
          <h1 style="font: var(--text-headline-md);">在线 Ping</h1>
          <p style="font: var(--text-body-md); color: var(--color-on-surface-variant);">在线 Ping 测试工具，检测网络连通性和延迟</p>
        </div>
        <div class="tool-page-body">
          <div style="padding:32px;text-align:center;">
            <div style="margin-bottom:24px;color:var(--color-on-surface-variant);font:var(--text-body-lg);">
              将跳转到 ITDOG 在线 Ping 工具
            </div>
            <a href="https://www.itdog.cn/ping/" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="display:inline-flex;align-items:center;gap:8px;text-decoration:none;padding:12px 32px;font:var(--text-label-lg);">
              ${icon('send')} 打开在线 Ping
            </a>
            <div style="margin-top:16px;color:var(--color-on-surface-variant);font:var(--text-body-sm);">
              itdog.cn/ping
            </div>
          </div>
        </div>
      </div>
    `;
  },
};
