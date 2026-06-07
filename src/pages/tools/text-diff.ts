import { icon } from '../../core/icons';

type DiffOp = { type: 'equal' | 'add' | 'del'; leftIdx?: number; rightIdx?: number; text: string };

function computeLCS(a: string[], b: string[]): DiffOp[] {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }

  const ops: DiffOp[] = [];
  let i = m, j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      ops.push({ type: 'equal', leftIdx: i - 1, rightIdx: j - 1, text: a[i - 1] });
      i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      ops.push({ type: 'add', rightIdx: j - 1, text: b[j - 1] });
      j--;
    } else {
      ops.push({ type: 'del', leftIdx: i - 1, text: a[i - 1] });
      i--;
    }
  }

  return ops.reverse();
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export default {
  id: 'text-diff',
  name: '文本差异对比',
  icon: 'difference',
  render(container: HTMLElement) {
    container.innerHTML = `
      <div class="content">
        <div class="tool-page-header">
          <a href="#/text" class="tool-page-back">${icon('description')} 文本处理</a>
          <h1 style="font: var(--text-headline-md);">文本差异对比</h1>
          <p style="font: var(--text-body-md); color: var(--color-on-surface-variant);">高亮显示两段文本的逐行差异</p>
        </div>

        <div class="tool-page-body">
          <div class="tool-split">
            <div class="tool-split-pane">
              <label class="tool-label">原始文本</label>
              <textarea id="diff-left" class="tool-textarea" rows="16" placeholder="粘贴原始文本..."></textarea>
            </div>
            <div class="tool-split-pane">
              <label class="tool-label">修改后文本</label>
              <textarea id="diff-right" class="tool-textarea" rows="16" placeholder="粘贴修改后的文本..."></textarea>
            </div>
          </div>

          <div class="tool-actions">
            <button class="btn btn-primary" id="diff-btn">对比差异</button>
            <button class="btn btn-secondary" id="diff-clear">清空</button>
          </div>

          <div id="diff-result" style="display: none;">
            <label class="tool-label">对比结果</label>
            <div id="diff-output" class="tool-output"></div>
          </div>
        </div>
      </div>
    `;

    const leftEl = container.querySelector('#diff-left') as HTMLTextAreaElement;
    const rightEl = container.querySelector('#diff-right') as HTMLTextAreaElement;
    const resultEl = container.querySelector('#diff-result') as HTMLElement;
    const outputEl = container.querySelector('#diff-output') as HTMLElement;

    container.querySelector('#diff-btn')!.addEventListener('click', () => {
      const left = leftEl.value;
      const right = rightEl.value;
      if (!left && !right) return;

      const leftLines = left.split('\n');
      const rightLines = right.split('\n');
      const ops = computeLCS(leftLines, rightLines);

      let html = '<table class="diff-table">';
      let leftNum = 0, rightNum = 0;
      for (const op of ops) {
        if (op.type === 'equal') {
          leftNum++;
          rightNum++;
          html += `<tr>
            <td class="diff-ln">${leftNum}</td>
            <td class="diff-text">${escapeHtml(op.text)}</td>
            <td class="diff-ln">${rightNum}</td>
            <td class="diff-text">${escapeHtml(op.text)}</td>
          </tr>`;
        } else if (op.type === 'del') {
          leftNum++;
          html += `<tr class="diff-del">
            <td class="diff-ln">${leftNum}</td>
            <td class="diff-text">${escapeHtml(op.text)}</td>
            <td class="diff-ln"></td>
            <td class="diff-text"></td>
          </tr>`;
        } else {
          rightNum++;
          html += `<tr class="diff-add">
            <td class="diff-ln"></td>
            <td class="diff-text"></td>
            <td class="diff-ln">${rightNum}</td>
            <td class="diff-text">${escapeHtml(op.text)}</td>
          </tr>`;
        }
      }
      html += '</table>';
      outputEl.innerHTML = html;
      resultEl.style.display = 'block';
    });

    container.querySelector('#diff-clear')!.addEventListener('click', () => {
      leftEl.value = '';
      rightEl.value = '';
      resultEl.style.display = 'none';
    });
  },
};
