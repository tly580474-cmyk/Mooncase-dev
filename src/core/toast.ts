let toastEl: HTMLElement | null = null;
let hideTimer: number | null = null;

function ensureToast(): HTMLElement {
  if (!toastEl) {
    toastEl = document.createElement('div');
    toastEl.className = 'toast';
    document.body.appendChild(toastEl);
  }
  return toastEl;
}

export function showToast(message: string, duration = 2000): void {
  const el = ensureToast();
  el.textContent = message;
  el.classList.add('show');

  if (hideTimer !== null) {
    clearTimeout(hideTimer);
  }

  hideTimer = window.setTimeout(() => {
    el.classList.remove('show');
    hideTimer = null;
  }, duration);
}
