import { icon } from '../../core/icons';

export default {
  id: 'online-tcping',
  name: '在线 TCPing',
  icon: 'wifi',
  render(container: HTMLElement) {
    container.innerHTML = `
      <div class="content">
        <div class="tool-page-header">
          <a href="#/network" class="tool-page-back">${icon('language')} 网络诊断</a>
          <h1 style="font: var(--text-headline-md);">在线 TCPing</h1>
          <p style="font: var(--text-body-md); color: var(--color-on-surface-variant);">在线 TCP 端口连通性测试</p>
        </div>
        <div class="tool-page-body">
          <div style="padding:32px;text-align:center;">
            <div style="margin-bottom:24px;color:var(--color-on-surface-variant);font:var(--text-body-lg);">
              将跳转到 ITDOG 在线 TCPing 工具
            </div>
            <a href="https://www.itdog.cn/tcping/" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="display:inline-flex;align-items:center;gap:8px;text-decoration:none;padding:12px 32px;font:var(--text-label-lg);">
              ${icon('wifi')} 打开在线 TCPing
            </a>
            <div style="margin-top:16px;color:var(--color-on-surface-variant);font:var(--text-body-sm);">
              itdog.cn/tcping
            </div>
          </div>
        </div>
      </div>
    `;
  },
};
