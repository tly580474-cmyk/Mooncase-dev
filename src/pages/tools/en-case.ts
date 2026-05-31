import { icon } from '../../core/icons';

export default {
  id: 'en-case',
  name: '英文大小写转化器',
  icon: 'title',
  render(container: HTMLElement) {
    container.innerHTML = `
      <div class="content">
        <div class="tool-page-header">
          <a href="#/text" class="tool-page-back">${icon('description')} 文本工具</a>
          <h1 style="font: var(--text-headline-md);">英文大小写转化器</h1>
          <p style="font: var(--text-body-md); color: var(--color-on-surface-variant);">英文句子/标题/大小写转换</p>
        </div>
        <div class="tool-page-body">
          <div class="tool-field">
            <label class="tool-label">输入英文文本</label>
            <textarea id="en-input" class="tool-textarea" rows="8" placeholder="Enter English text here..."></textarea>
          </div>
          <div class="tool-actions">
            <button class="btn btn-primary" id="en-upper">UPPER CASE</button>
            <button class="btn btn-primary" id="en-lower">lower case</button>
            <button class="btn btn-primary" id="en-title">Title Case</button>
            <button class="btn btn-primary" id="en-sentence">Sentence case</button>
            <button class="btn btn-primary" id="en-alt">aLtErNaTiNg CaSe</button>
            <button class="btn btn-primary" id="en-invert">iNVERT cASE</button>
            <button class="btn btn-secondary" id="en-clear">清空</button>
          </div>
          <div class="tool-field">
            <label class="tool-label">转换结果</label>
            <textarea id="en-output" class="tool-textarea" rows="8" readonly placeholder="Result will appear here..."></textarea>
          </div>
          <div class="tool-actions">
            <button class="btn btn-ghost" id="en-copy">复制结果</button>
          </div>
        </div>
      </div>
    `;

    const input = container.querySelector('#en-input') as HTMLTextAreaElement;
    const output = container.querySelector('#en-output') as HTMLTextAreaElement;

    // Title Case: capitalize first letter of each word (minor words lowercase)
    const minorWords = new Set(['a','an','the','and','but','or','for','nor','on','at','to','by','in','of','with','as','is','it']);
    const toTitleCase = (s: string) => s.replace(/\b(\w)(\w*)/g, (_m, f, rest) => {
      const word = f + rest;
      if (minorWords.has(word.toLowerCase()) && _m !== s.split(/\s+/)[0]) {
        return word.toLowerCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    });

    const toSentenceCase = (s: string) => s.replace(/(^\s*|[.!?]+[\s]+)([a-z])/g, (_m, sep, c) => sep + c.toUpperCase()).replace(/^(.)/, (_m, c) => c.toUpperCase());

    const alternating = (s: string) => s.split('').map((c, i) => i % 2 ? c.toUpperCase() : c.toLowerCase()).join('');
    const inverted = (s: string) => s.replace(/[a-zA-Z]/g, c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase());

    container.querySelector('#en-upper')!.addEventListener('click', () => { output.value = input.value.toUpperCase(); });
    container.querySelector('#en-lower')!.addEventListener('click', () => { output.value = input.value.toLowerCase(); });
    container.querySelector('#en-title')!.addEventListener('click', () => { output.value = toTitleCase(input.value); });
    container.querySelector('#en-sentence')!.addEventListener('click', () => { output.value = toSentenceCase(input.value); });
    container.querySelector('#en-alt')!.addEventListener('click', () => { output.value = alternating(input.value); });
    container.querySelector('#en-invert')!.addEventListener('click', () => { output.value = inverted(input.value); });
    container.querySelector('#en-clear')!.addEventListener('click', () => { input.value = ''; output.value = ''; });
    container.querySelector('#en-copy')!.addEventListener('click', () => { navigator.clipboard.writeText(output.value); });
  },
};
