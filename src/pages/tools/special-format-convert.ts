import { icon } from '../../core/icons';

const TARGET_URL = 'https://convert.freelrc.com/site/formats';

export default {
  id: 'special-format-convert',
  name: '特殊格式转换',
  icon: 'alert',

  render(container: HTMLElement) {
    container.innerHTML = `
      <style>
        .sfc-panel {
          max-width: 760px;
          border: 1px solid var(--color-outline-variant);
          border-radius: var(--radius-lg);
          background: var(--color-surface-container-lowest);
          padding: 24px;
          box-shadow: var(--shadow-sm);
        }
        .sfc-warning {
          display: flex;
          gap: 12px;
          padding: 16px;
          border: 1px solid var(--color-outline-variant);
          border-radius: var(--radius-md);
          background: var(--color-surface-container);
          color: var(--color-on-surface);
        }
        .sfc-warning-icon {
          flex: 0 0 auto;
          color: var(--color-error);
        }
        .sfc-warning h2 {
          margin: 0 0 8px;
          font: var(--text-headline-sm);
        }
        .sfc-warning p {
          margin: 0;
          color: var(--color-on-surface-variant);
          font: var(--text-body-md);
          line-height: 1.7;
        }
        .sfc-link-row {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 20px;
        }
        .sfc-url {
          margin-top: 14px;
          color: var(--color-on-surface-variant);
          font: var(--text-body-sm);
          overflow-wrap: anywhere;
        }
        @media (max-width: 640px) {
          .sfc-panel {
            padding: 18px;
          }
          .sfc-warning {
            flex-direction: column;
          }
          .sfc-link-row .btn {
            width: 100%;
          }
        }
      </style>
      <div class="content">
        <div class="tool-page-header">
          <a href="#/conversion" class="tool-page-back">${icon('convert')} 格式转换</a>
          <h1 style="font: var(--text-headline-md);">特殊格式转换</h1>
          <p style="font: var(--text-body-md); color: var(--color-on-surface-variant);">跳转到外部特殊音频格式转换页面</p>
        </div>

        <div class="sfc-panel">
          <div class="sfc-warning">
            <span class="sfc-warning-icon">${icon('alert', 24)}</span>
            <div>
              <h2>风险提示</h2>
              <p>
                该链接指向第三方站点，请自行确认文件来源、版权归属和使用边界。
                本站不储存、复制、传播任何文件，不做任何盈利，仅作个人公益学习，请勿非法&商业传播。
              </p>
            </div>
          </div>

          <div class="sfc-link-row">
            <a href="${TARGET_URL}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
              ${icon('link')} 前往特殊格式转换
            </a>
            <a href="#/conversion" class="btn btn-secondary">
              ${icon('convert')} 返回格式转换
            </a>
          </div>

          <div class="sfc-url">${TARGET_URL}</div>
        </div>
      </div>
    `;
  },

  destroy() {},
};
