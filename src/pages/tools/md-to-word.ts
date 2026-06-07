import { icon } from '../../core/icons';

// 简易 Markdown → HTML 解析器
function mdToHtml(md: string): string {
  let html = md
    // 代码块
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="lang-$1">$2</code></pre>')
    // 行内代码
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // 标题
    .replace(/^######\s+(.+)$/gm, '<h6>$1</h6>')
    .replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>')
    .replace(/^####\s+(.+)$/gm, '<h4>$1</h4>')
    .replace(/^###\s+(.+)$/gm, '<h3>$1</h3>')
    .replace(/^##\s+(.+)$/gm, '<h2>$1</h2>')
    .replace(/^#\s+(.+)$/gm, '<h1>$1</h1>')
    // 粗体和斜体
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // 删除线
    .replace(/~~(.+?)~~/g, '<del>$1</del>')
    // 链接和图片
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2" />')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    // 水平线
    .replace(/^---+$/gm, '<hr />')
    // 无序列表
    .replace(/^[\-\*]\s+(.+)$/gm, '<li data-list="ul">$1</li>')
    // 有序列表
    .replace(/^\d+\.\s+(.+)$/gm, '<li data-list="ol">$1</li>')
    // 引用
    .replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>')
    // 表格行（标记分隔行，后续处理时识别表头）
    .replace(/^\|(.+)\|$/gm, (_match, content) => {
      if (/^[\s\-:|]+$/.test(content)) return '<tr-sep />';
      const cells = content.split('|').map((c: string) => c.trim());
      return '<tr>' + cells.map((c: string) => `<td>${c}</td>`).join('') + '</tr>';
    });

  // 段落处理
  const lines = html.split('\n');
  const result: string[] = [];
  let inList = false;
  let listType: 'ul' | 'ol' = 'ul';
  let nextRowIsHeader = false;

  for (const line of lines) {
    if (line.startsWith('<li')) {
      const lt = line.match(/data-list="(ul|ol)"/)?.[1] as 'ul' | 'ol' ?? 'ul';
      if (!inList || lt !== listType) {
        if (inList) result.push(`</${listType}>`);
        listType = lt;
        result.push(`<${listType}>`);
        inList = true;
      }
      result.push(line.replace(/ data-list="[^"]*"/, ''));
    } else {
      if (inList) { result.push(`</${listType}>`); inList = false; }
      if (line === '<tr-sep />') {
        nextRowIsHeader = true;
      } else if (line.startsWith('<tr>')) {
        if (nextRowIsHeader) {
          result.push(line.replace(/<td>/g, '<th>').replace(/<\/td>/g, '</th>'));
          nextRowIsHeader = false;
        } else {
          result.push(line);
        }
      } else if (line.trim() === '') {
        result.push('');
      } else if (line.startsWith('<h') || line.startsWith('<hr') || line.startsWith('<pre') || line.startsWith('<blockquote') || line.startsWith('<img')) {
        result.push(line);
      } else {
        result.push(`<p>${line}</p>`);
      }
    }
  }
  if (inList) result.push(`</${listType}>`);

  return result.join('\n');
}

// 生成 Word 兼容 HTML
function wrapWordHtml(bodyHtml: string, title: string): string {
  return `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8" />
<title>${title}</title>
<style>
  body { font-family: "Microsoft YaHei", "SimSun", sans-serif; font-size: 14px; line-height: 1.8; color: #333; max-width: 800px; margin: 0 auto; padding: 40px; }
  h1 { font-size: 26px; border-bottom: 2px solid #1b57bd; padding-bottom: 8px; color: #1b57bd; }
  h2 { font-size: 22px; color: #1b57bd; }
  h3 { font-size: 18px; }
  p { margin: 8px 0; }
  code { background: #f5f5f5; padding: 2px 6px; border-radius: 4px; font-family: "Consolas", monospace; font-size: 13px; }
  pre { background: #f5f5f5; padding: 16px; border-radius: 8px; overflow-x: auto; }
  pre code { background: none; padding: 0; }
  blockquote { border-left: 4px solid #1b57bd; margin: 16px 0; padding: 8px 16px; color: #666; background: #f8f9fb; }
  table { border-collapse: collapse; width: 100%; margin: 16px 0; }
  td, th { border: 1px solid #ddd; padding: 8px 12px; }
  th { background: #f0f4f8; font-weight: bold; text-align: left; }
  hr { border: none; border-top: 1px solid #ddd; margin: 24px 0; }
  img { max-width: 100%; }
  ul, ol { padding-left: 24px; }
  li { margin: 4px 0; }
</style>
</head>
<body>
${bodyHtml}
</body>
</html>`;
}

export default {
  id: 'md-to-word',
  name: 'Markdown 转 Word',
  icon: 'description',
  render(container: HTMLElement) {
    container.innerHTML = `
      <div class="content">
        <div class="tool-page-header">
          <a href="#/document" class="tool-page-back">${icon('file_type')} 文档 PDF</a>
          <h1 style="font: var(--text-headline-md);">Markdown 转 Word</h1>
          <p style="font: var(--text-body-md); color: var(--color-on-surface-variant);">将 Markdown 文本转换为 Word 文档</p>
        </div>
        <div class="tool-page-body">
          <div class="tool-field">
            <label class="tool-label">输入 Markdown</label>
            <textarea id="md-input" class="tool-textarea" rows="14" placeholder="# 标题\n\n这是一段 **Markdown** 文本。\n\n- 列表项 1\n- 列表项 2\n\n> 引用内容" style="font-family: var(--font-mono);"></textarea>
          </div>
          <div class="tool-actions">
            <button class="btn btn-primary" id="md-preview-btn">预览</button>
            <button class="btn btn-primary" id="md-download-btn">${icon('download')} 下载 Word 文档</button>
            <button class="btn btn-secondary" id="md-copy-html">复制 HTML</button>
            <button class="btn btn-secondary" id="md-clear">清空</button>
          </div>
          <div class="tool-field">
            <label class="tool-label">预览</label>
            <div id="md-preview" class="tool-output" style="min-height: 120px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.8; padding: 24px;">
              <span style="color: var(--color-on-surface-variant); opacity: 0.5;">点击"预览"查看渲染效果</span>
            </div>
          </div>
        </div>
      </div>
    `;

    const input = container.querySelector('#md-input') as HTMLTextAreaElement;
    const preview = container.querySelector('#md-preview') as HTMLElement;

    container.querySelector('#md-preview-btn')!.addEventListener('click', () => {
      preview.innerHTML = mdToHtml(input.value);
    });

    container.querySelector('#md-download-btn')!.addEventListener('click', () => {
      const html = mdToHtml(input.value);
      const title = input.value.match(/^#\s+(.+)/m)?.[1] || '文档';
      const fullHtml = wrapWordHtml(html, title);
      const blob = new Blob([fullHtml], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title}.doc`;
      a.click();
      URL.revokeObjectURL(url);
    });

    container.querySelector('#md-copy-html')!.addEventListener('click', () => {
      const html = mdToHtml(input.value);
      navigator.clipboard.writeText(html);
    });

    container.querySelector('#md-clear')!.addEventListener('click', () => {
      input.value = '';
      preview.innerHTML = '<span style="color: var(--color-on-surface-variant); opacity: 0.5;">点击"预览"查看渲染效果</span>';
    });
  },
};
