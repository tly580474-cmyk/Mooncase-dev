import { icon } from '../../core/icons';

function uuidv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = crypto.getRandomValues(new Uint8Array(1))[0] % 16;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export default {
  id: 'uuid-gen',
  name: 'UUID 生成器',
  icon: 'tag',
  render(container: HTMLElement) {
    container.innerHTML = `
      <div class="content">
        <div class="tool-page-header">
          <a href="#/dev" class="tool-page-back">${icon('code')} 开发调试</a>
          <h1 style="font: var(--text-headline-md);">UUID 生成器</h1>
          <p style="font: var(--text-body-md); color: var(--color-on-surface-variant);">生成 v4 UUID</p>
        </div>
        <div class="tool-page-body">
          <div class="tool-field">
            <label class="tool-label">生成数量: <span id="uuid-count-val">5</span></label>
            <input type="range" id="uuid-count" min="1" max="50" value="5" style="width: 100%; accent-color: var(--color-primary);" />
          </div>
          <div class="tool-actions">
            <button class="btn btn-primary" id="uuid-gen-btn">生成</button>
            <label class="tool-checkbox"><input type="checkbox" id="uuid-upper" /> 大写</label>
            <label class="tool-checkbox"><input type="checkbox" id="uuid-nodash" /> 无连字符</label>
            <button class="btn btn-ghost" id="uuid-copy">${icon('clipboard')} 复制全部</button>
          </div>
          <div class="tool-field">
            <div id="uuid-output" class="tool-output" style="font-family: var(--font-mono); line-height: 2;"></div>
          </div>
        </div>
      </div>
    `;

    const countEl = container.querySelector('#uuid-count') as HTMLInputElement;
    const countVal = container.querySelector('#uuid-count-val') as HTMLElement;
    const output = container.querySelector('#uuid-output') as HTMLElement;
    const upperEl = container.querySelector('#uuid-upper') as HTMLInputElement;
    const noDashEl = container.querySelector('#uuid-nodash') as HTMLInputElement;

    function gen() {
      const count = Number(countEl.value);
      countVal.textContent = String(count);
      const uuids = Array.from({ length: count }, () => {
        let u = uuidv4();
        if (upperEl.checked) u = u.toUpperCase();
        if (noDashEl.checked) u = u.replace(/-/g, '');
        return u;
      });
      output.innerHTML = uuids.map(u =>
        `<div style="padding: 4px 0; border-bottom: 1px solid var(--color-outline-variant); cursor: pointer;" onclick="navigator.clipboard.writeText('${u}')">${u}</div>`
      ).join('');
    }

    countEl.addEventListener('input', gen);
    container.querySelector('#uuid-gen-btn')!.addEventListener('click', gen);
    upperEl.addEventListener('change', gen);
    noDashEl.addEventListener('change', gen);
    container.querySelector('#uuid-copy')!.addEventListener('click', () => {
      const text = output.innerText;
      navigator.clipboard.writeText(text);
    });

    gen();
  },
};
