import { icon } from '../../core/icons';

export default {
  id: 'localhost-net',
  name: '本地网络',
  icon: 'network',
  render(container: HTMLElement) {
    container.innerHTML = `
      <div class="content">
        <div class="tool-page-header">
          <a href="#/network" class="tool-page-back">${icon('language')} 网络工具</a>
          <h1 style="font: var(--text-headline-md);">本地网络</h1>
          <p style="font: var(--text-body-md); color: var(--color-on-surface-variant);">查看本地网络信息</p>
        </div>
        <div class="tool-page-body">
          <div style="padding:32px;text-align:center;">
            <div style="margin-bottom:24px;color:var(--color-on-surface-variant);font:var(--text-body-lg);">
              将跳转到 ITDOG 本地网络工具
            </div>
            <a href="http://itdog.cn/localhost/" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="display:inline-flex;align-items:center;gap:8px;text-decoration:none;padding:12px 32px;font:var(--text-label-lg);">
              ${icon('network')} 打开本地网络
            </a>
            <div style="margin-top:16px;color:var(--color-on-surface-variant);font:var(--text-body-sm);">
              itdog.cn/localhost
            </div>
          </div>
        </div>
      </div>
    `;
  },
};
