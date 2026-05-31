import './styles/tokens.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/components.css';
import { initShell } from './core/shell';
import { navigate } from './core/router';

document.addEventListener('DOMContentLoaded', () => {
  initShell();

  // 首次加载时导航到 hash 指定的页面
  const hash = location.hash.slice(2) || 'home';
  location.hash = '#/' + hash;
  navigate(hash);
});
