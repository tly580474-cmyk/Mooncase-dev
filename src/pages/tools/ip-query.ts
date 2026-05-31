import { icon } from '../../core/icons';

export default {
  id: 'ip-query',
  name: 'IP 地址查询',
  icon: 'language',
  render(container: HTMLElement) {
    container.innerHTML = `
      <div class="content">
        <div class="tool-page-header">
          <a href="#/network" class="tool-page-back">${icon('language')} 网络工具</a>
          <h1 style="font: var(--text-headline-md);">IP 地址查询</h1>
          <p style="font: var(--text-body-md); color: var(--color-on-surface-variant);">查询当前公网 IP 地址和归属地信息</p>
        </div>
        <div class="tool-page-body">
          <div class="tool-actions">
            <button class="btn btn-primary" id="ip-query-btn">查询我的 IP</button>
          </div>
          <div id="ip-loading" style="display: none; padding: 24px; text-align: center; color: var(--color-on-surface-variant);">查询中...</div>
          <div id="ip-result" style="display: none;">
            <div class="stat-grid" style="grid-template-columns: repeat(2, 1fr);">
              <div class="stat-card">
                <div class="stat-value" id="ip-address" style="font-size: 24px;">-</div>
                <div class="stat-label">公网 IP</div>
              </div>
              <div class="stat-card">
                <div class="stat-value" id="ip-location" style="font-size: 16px;">-</div>
                <div class="stat-label">归属地</div>
              </div>
              <div class="stat-card">
                <div class="stat-value" id="ip-isp" style="font-size: 14px;">-</div>
                <div class="stat-label">运营商</div>
              </div>
              <div class="stat-card">
                <div class="stat-value" id="ip-tz" style="font-size: 14px;">-</div>
                <div class="stat-label">时区</div>
              </div>
            </div>
          </div>
          <div id="ip-error" style="display: none; padding: 16px; color: var(--color-error);"></div>
        </div>
      </div>
    `;

    const loading = container.querySelector('#ip-loading') as HTMLElement;
    const result = container.querySelector('#ip-result') as HTMLElement;
    const error = container.querySelector('#ip-error') as HTMLElement;

    container.querySelector('#ip-query-btn')!.addEventListener('click', async () => {
      loading.style.display = 'block';
      result.style.display = 'none';
      error.style.display = 'none';

      try {
        const res = await fetch('https://ipapi.co/json/');
        if (!res.ok) throw new Error('查询失败');
        const data = await res.json();

        (container.querySelector('#ip-address') as HTMLElement).textContent = data.ip || '-';
        (container.querySelector('#ip-location') as HTMLElement).textContent =
          [data.city, data.region, data.country_name].filter(Boolean).join(', ') || '-';
        (container.querySelector('#ip-isp') as HTMLElement).textContent = data.org || '-';
        (container.querySelector('#ip-tz') as HTMLElement).textContent = data.timezone || '-';

        loading.style.display = 'none';
        result.style.display = 'block';
      } catch (e: any) {
        loading.style.display = 'none';
        error.textContent = '查询失败: ' + e.message + '（请检查网络连接）';
        error.style.display = 'block';
      }
    });
  },
};
