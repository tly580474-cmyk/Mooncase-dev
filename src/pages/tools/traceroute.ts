import { icon } from '../../core/icons';

export default {
  id: 'traceroute',
  name: '路由追踪',
  icon: 'route',
  render(container: HTMLElement) {
    container.innerHTML = `
      <div class="content">
        <div class="tool-page-header">
          <a href="#/network" class="tool-page-back">${icon('language')} 网络诊断</a>
          <h1 style="font: var(--text-headline-md);">路由追踪</h1>
          <p style="font: var(--text-body-md); color: var(--color-on-surface-variant);">在线路由追踪分析</p>
        </div>
        <div class="tool-page-body">
          <div style="padding:32px;text-align:center;">
            <div style="margin-bottom:24px;color:var(--color-on-surface-variant);font:var(--text-body-lg);">
              将跳转到 ITDOG 路由追踪工具
            </div>
            <a href="https://www.itdog.cn/traceroute/" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="display:inline-flex;align-items:center;gap:8px;text-decoration:none;padding:12px 32px;font:var(--text-label-lg);">
              ${icon('route')} 打开路由追踪
            </a>
            <div style="margin-top:16px;color:var(--color-on-surface-variant);font:var(--text-body-sm);">
              itdog.cn/traceroute
            </div>
          </div>
        </div>
      </div>
    `;
  },
};
