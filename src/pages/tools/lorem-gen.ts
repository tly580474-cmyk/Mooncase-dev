import { icon } from '../../core/icons';

const LOREM_WORDS = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum'.split(' ');

function generateLorem(paragraphs: number, wordsPerParagraph: number): string {
  const result: string[] = [];
  for (let p = 0; p < paragraphs; p++) {
    const words: string[] = [];
    for (let w = 0; w < wordsPerParagraph; w++) {
      const idx = Math.floor(Math.random() * LOREM_WORDS.length);
      words.push(LOREM_WORDS[idx]);
    }
    words[0] = words[0][0].toUpperCase() + words[0].slice(1);
    result.push(words.join(' ') + '.');
  }
  return result.join('\n\n');
}

export default {
  id: 'lorem-gen',
  name: '占位文生成',
  icon: 'article',
  render(container: HTMLElement) {
    container.innerHTML = `
      <div class="content">
        <div class="tool-page-header">
          <a href="#/generator" class="tool-page-back">${icon('sparkles')} 内容生成</a>
          <h1 style="font: var(--text-headline-md);">占位文生成</h1>
          <p style="font: var(--text-body-md); color: var(--color-on-surface-variant);">生成 Lorem Ipsum 占位文本</p>
        </div>
        <div class="tool-page-body">
          <div class="tool-split">
            <div class="tool-field">
              <label class="tool-label">段落数: <span id="lorem-p-val">3</span></label>
              <input type="range" id="lorem-paragraphs" min="1" max="20" value="3" style="width: 100%; accent-color: var(--color-primary);" />
            </div>
            <div class="tool-field">
              <label class="tool-label">每段词数: <span id="lorem-w-val">50</span></label>
              <input type="range" id="lorem-words" min="10" max="200" value="50" style="width: 100%; accent-color: var(--color-primary);" />
            </div>
          </div>
          <div class="tool-actions">
            <button class="btn btn-primary" id="lorem-gen-btn">生成</button>
            <button class="btn btn-ghost" id="lorem-copy">${icon('clipboard')} 复制</button>
          </div>
          <div class="tool-field">
            <textarea id="lorem-output" class="tool-textarea" rows="12" readonly placeholder="生成结果..."></textarea>
          </div>
        </div>
      </div>
    `;

    const pEl = container.querySelector('#lorem-paragraphs') as HTMLInputElement;
    const wEl = container.querySelector('#lorem-words') as HTMLInputElement;
    const pVal = container.querySelector('#lorem-p-val') as HTMLElement;
    const wVal = container.querySelector('#lorem-w-val') as HTMLElement;
    const output = container.querySelector('#lorem-output') as HTMLTextAreaElement;

    function gen() {
      pVal.textContent = pEl.value;
      wVal.textContent = wEl.value;
      output.value = generateLorem(Number(pEl.value), Number(wEl.value));
    }

    pEl.addEventListener('input', gen);
    wEl.addEventListener('input', gen);
    container.querySelector('#lorem-gen-btn')!.addEventListener('click', gen);
    container.querySelector('#lorem-copy')!.addEventListener('click', () => {
      navigator.clipboard.writeText(output.value);
    });

    gen();
  },
};
