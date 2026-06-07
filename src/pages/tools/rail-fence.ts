import { icon } from '../../core/icons';

function railFenceEncrypt(text: string, rails: number): string {
  if (rails <= 1 || rails >= text.length) return text;
  const fence: string[][] = Array.from({ length: rails }, () => []);
  let row = 0, dir = 1;
  for (const ch of text) {
    fence[row].push(ch);
    if (row === 0) dir = 1;
    else if (row === rails - 1) dir = -1;
    row += dir;
  }
  return fence.flat().join('');
}

function railFenceDecrypt(text: string, rails: number): string {
  if (rails <= 1 || rails >= text.length) return text;
  const n = text.length;
  // Mark the rail positions
  const pattern: number[][] = Array.from({ length: rails }, () => []);
  let row = 0, dir = 1;
  for (let i = 0; i < n; i++) {
    pattern[row].push(i);
    if (row === 0) dir = 1;
    else if (row === rails - 1) dir = -1;
    row += dir;
  }
  // Fill in characters
  const result = new Array(n);
  let idx = 0;
  for (let r = 0; r < rails; r++) {
    for (const pos of pattern[r]) {
      result[pos] = text[idx++];
    }
  }
  return result.join('');
}

export default {
  id: 'rail-fence',
  name: '栅栏密码',
  icon: 'grid_view',
  render(container: HTMLElement) {
    container.innerHTML = `
      <div class="content">
        <div class="tool-page-header">
          <a href="#/security" class="tool-page-back">${icon('security')} 密码安全</a>
          <h1 style="font: var(--text-headline-md);">栅栏密码</h1>
          <p style="font: var(--text-body-md); color: var(--color-on-surface-variant);">将文本按 Z 字形排列后逐行读取</p>
        </div>
        <div class="tool-page-body">
          <div class="tool-field">
            <label class="tool-label">输入文本</label>
            <textarea id="rf-input" class="tool-textarea" rows="3" placeholder="输入文本..."></textarea>
          </div>
          <div class="tool-field">
            <label class="tool-label">栅栏数（行数）</label>
            <input id="rf-rails" class="tool-input" type="number" min="2" max="20" value="3" />
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-primary" id="rf-encrypt" style="flex: 1;">${icon('lock')} 加密</button>
            <button class="btn btn-ghost" id="rf-decrypt" style="flex: 1;">${icon('unlock')} 解密</button>
          </div>
          <div class="tool-field" style="margin-top: 16px;">
            <label class="tool-label">结果</label>
            <textarea id="rf-output" class="tool-textarea" rows="3" readonly></textarea>
          </div>
          <div class="tool-field">
            <label class="tool-label">可视化过程</label>
            <div id="rf-visual" style="
              padding: 12px; background: var(--color-surface-container);
              border-radius: var(--radius-md); font-family: monospace; font-size: 14px;
              line-height: 1.6; white-space: pre; overflow-x: auto; min-height: 40px;
            "></div>
          </div>
        </div>
      </div>
    `;

    const inputEl = container.querySelector('#rf-input') as HTMLTextAreaElement;
    const outputEl = container.querySelector('#rf-output') as HTMLTextAreaElement;
    const railsEl = container.querySelector('#rf-rails') as HTMLInputElement;
    const visualEl = container.querySelector('#rf-visual') as HTMLElement;

    function visualize(text: string, rails: number) {
      if (!text || rails <= 1) { visualEl.textContent = ''; return; }
      const grid: string[][] = Array.from({ length: rails }, () => Array(text.length).fill(' '));
      let row = 0, dir = 1;
      for (let i = 0; i < text.length; i++) {
        grid[row][i] = text[i];
        if (row === 0) dir = 1;
        else if (row === rails - 1) dir = -1;
        row += dir;
      }
      visualEl.textContent = grid.map(r => r.join('')).join('\n');
    }

    container.querySelector('#rf-encrypt')!.addEventListener('click', () => {
      const rails = parseInt(railsEl.value) || 3;
      const text = inputEl.value;
      const result = railFenceEncrypt(text, rails);
      outputEl.value = result;
      visualize(text, rails);
    });

    container.querySelector('#rf-decrypt')!.addEventListener('click', () => {
      const rails = parseInt(railsEl.value) || 3;
      const text = inputEl.value;
      outputEl.value = railFenceDecrypt(text, rails);
    });
  },
};
