import { icon } from './icons';
import { getCurrentToolId, onRouteChange, setContentArea, navigate, initRouter } from './router';
import { initSearch } from './search';
import { initTheme } from './theme';
import { getCategories, getRegistry, type ToolCategory } from './registry';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  category?: ToolCategory;
}

const navItems: NavItem[] = [
  { id: 'home', label: '首页', icon: 'history' },
  ...getCategories().map(category => ({
    id: category.id,
    label: category.name,
    icon: category.icon,
    category: category.id,
  })),
];

function renderSidebar(): string {
  return `
    <div class="sidebar-header">
      <div class="sidebar-brand">月光宝盒</div>
      <div class="sidebar-subtitle">Utility Platform</div>
    </div>
    <nav class="sidebar-nav" id="sidebar-nav">
      ${navItems.map(item => `
        <a class="nav-item" href="#/${item.id}" data-nav-id="${item.id}">
          <span class="icon">${icon(item.icon)}</span>
          <span>${item.label}</span>
        </a>
      `).join('')}
    </nav>
  `;
}

function renderHeader(): string {
  return `
    <div class="header-left">
      <button class="btn btn-ghost btn-icon mobile-menu-btn" style="display: none;">
        ${icon('menu')}
      </button>
      <nav class="header-breadcrumb" id="header-breadcrumb"></nav>
    </div>
    <div class="header-right">
      <button class="btn btn-ghost btn-icon" data-action="toggle-theme" title="切换主题">
        ${icon('light_mode')}
      </button>
    </div>
  `;
}

function updateActiveNav() {
  const currentId = getCurrentToolId();
  const navItems = document.querySelectorAll<HTMLElement>('.nav-item[data-nav-id]');

  navItems.forEach(el => {
    const id = el.dataset.navId!;
    const isActive = id === currentId || (currentId === 'home' && id === 'home');
    el.classList.toggle('active', isActive);
  });
}

function updateBreadcrumb() {
  const el = document.getElementById('header-breadcrumb');
  if (!el) return;

  const currentId = getCurrentToolId();
  if (currentId === 'home') {
    el.innerHTML = `<span style="font-weight: 600; font-size: 13px;">月光宝盒</span>`;
  } else {
    const registry = getRegistry();
    const tool = registry.find(t => t.id === currentId);
    const name = tool?.name || currentId;
    el.innerHTML = `
      <a href="#/" style="font-size: 13px; color: var(--color-on-surface-variant);">首页</a>
      <span style="margin: 0 6px; color: var(--color-outline);">/</span>
      <span style="font-weight: 600; font-size: 13px;">${name}</span>
    `;
  }
}

function updateMobileMenu() {
  const isMobile = window.innerWidth < 1200;
  const mobileBtn = document.querySelector('.mobile-menu-btn') as HTMLElement;

  if (mobileBtn) {
    mobileBtn.style.display = isMobile ? 'flex' : 'none';
  }
}

export function initShell() {
  const app = document.getElementById('app')!;

  app.innerHTML = `
    <aside class="sidebar" id="sidebar">
      ${renderSidebar()}
    </aside>
    <div class="sidebar-overlay" id="sidebar-overlay"></div>
    <main class="main">
      <header class="header">
        ${renderHeader()}
      </header>
      <div id="content-area"></div>
    </main>
  `;

  const contentArea = document.getElementById('content-area')!;
  setContentArea(contentArea);

  // 初始化路由
  initRouter();

  // 初始化主题
  initTheme();

  // 初始化搜索
  const searchInput = document.getElementById('global-search') as HTMLInputElement;
  if (searchInput) {
    initSearch(searchInput, (toolId) => {
      navigate(toolId);
    });
  }

  // 路由变化时更新导航状态
  onRouteChange(() => {
    updateActiveNav();
    updateBreadcrumb();
    // 关闭移动端菜单
    const sidebar = document.querySelector('.sidebar') as HTMLElement;
    sidebar.classList.remove('open');
  });

  // 移动端菜单
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target.closest('.mobile-menu-btn')) {
      document.querySelector('.sidebar')?.classList.toggle('open');
    }
    if (target.closest('.sidebar-overlay')) {
      document.querySelector('.sidebar')?.classList.remove('open');
    }
  });

  // 窗口 resize
  window.addEventListener('resize', () => {
    updateMobileMenu();
  });

  updateMobileMenu();
  updateActiveNav();
  updateBreadcrumb();
}
