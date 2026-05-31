import { icon } from '../../core/icons';

export default {
  id: 'website-speed',
  name: '网站测速',
  icon: 'speedometer',
  render(container: HTMLElement) {
    container.innerHTML = `
      <div class="content">
        <div class="tool-page-header">
          <a href="#/network" class="tool-page-back">${icon('language')} 网络工具</a>
          <h1 style="font: var(--text-headline-md);">网站测速</h1>
          <p style="font: var(--text-body-md); color: var(--color-on-surface-variant);">在线网站访问速度测试</p>
        </div>
        <div class="tool-page-body">
          <div style="padding:32px;text-align:center;">
            <div style="margin-bottom:24px;color:var(--color-on-surface-variant);font:var(--text-body-lg);">
              将跳转到 ITDOG 网站测速工具
            </div>
            <a href="https://www.itdog.cn/http/" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="display:inline-flex;align-items:center;gap:8px;text-decoration:none;padding:12px 32px;font:var(--text-label-lg);">
              ${icon('speedometer')} 打开网站测速
            </a>
            <div style="margin-top:16px;color:var(--color-on-surface-variant);font:var(--text-body-sm);">
              itdog.cn/http
            </div>
          </div>
        </div>
      </div>
    `;
  },
};
