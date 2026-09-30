const { ipcRenderer } = require('electron');

let currentTheme = 'dark';
let autoSkipEnabled = true;
let isAppBarCollapsed = false;
let navState = { canGoBack: false, canGoForward: false };

// SVG Icon Pack (Minimalist, crisp vector icons)
const ICONS = {
  back: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>`,
  forward: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`,
  reload: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3"/></svg>`,
  home: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  explore: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>`,
  simulcast: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  watchlist: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>`,
  zap: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  speed: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  pip: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><rect x="12" y="10" width="8" height="6" rx="1"/></svg>`,
  moon: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`,
  sun: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>`,
  settings: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  chevronUp: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>`,
  chevronDown: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`
};

// Custom CSS Injection for modern, high-end desktop experience
const customStyles = `
  :root {
    --cr-bg: rgba(15, 16, 21, 0.88);
    --cr-bg-card: #191a22;
    --cr-bg-hover: rgba(255, 255, 255, 0.08);
    --cr-bg-active: rgba(255, 100, 0, 0.16);
    --cr-text: #f0f1f5;
    --cr-text-dim: #9094a6;
    --cr-border: rgba(255, 255, 255, 0.09);
    --cr-border-hover: rgba(255, 255, 255, 0.2);
    --cr-accent: #ff6400;
    --cr-accent-hover: #ff7c24;
    --cr-accent-glow: rgba(255, 100, 0, 0.35);
    --cr-font: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
  }

  [data-theme="light"] {
    --cr-bg: rgba(248, 249, 252, 0.9);
    --cr-bg-card: #ffffff;
    --cr-bg-hover: rgba(0, 0, 0, 0.06);
    --cr-bg-active: rgba(255, 100, 0, 0.12);
    --cr-text: #14151a;
    --cr-text-dim: #64687a;
    --cr-border: rgba(0, 0, 0, 0.1);
    --cr-border-hover: rgba(0, 0, 0, 0.2);
    --cr-accent: #ff6400;
    --cr-accent-hover: #e55a00;
    --cr-accent-glow: rgba(255, 100, 0, 0.2);
  }

  /* Page Layout Offset to comfortably fit App Bar */
  body {
    padding-top: 42px !important;
  }

  header, [class*="header_wrapper"], [class*="erc-header"], [data-t="header-wrapper"], nav[class*="header"] {
    top: 42px !important;
  }

  /* Sleek Scrollbars */
  ::-webkit-scrollbar {
    width: 6px !important;
    height: 6px !important;
    background: transparent !important;
  }
  ::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2) !important;
    border-radius: 10px !important;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 100, 0, 0.6) !important;
  }

  /* Top App Bar Glass Container */
  #cr-app-bar {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    height: 42px !important;
    background: var(--cr-bg) !important;
    color: var(--cr-text) !important;
    border-bottom: 1px solid var(--cr-border) !important;
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    padding: 0 16px !important;
    box-sizing: border-box !important;
    z-index: 2147483647 !important;
    font-family: var(--cr-font) !important;
    font-size: 13px !important;
    user-select: none !important;
    backdrop-filter: blur(24px) saturate(180%) !important;
    -webkit-backdrop-filter: blur(24px) saturate(180%) !important;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25) !important;
    transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), background 0.3s ease !important;
    opacity: 1 !important;
    visibility: visible !important;
  }

  #cr-app-bar.collapsed {
    transform: translateY(-38px) !important;
  }

  /* Fullscreen View: Hide App Bar entirely */
  :fullscreen #cr-app-bar,
  :-webkit-full-screen #cr-app-bar {
    display: none !important;
  }
  :fullscreen body,
  :-webkit-full-screen body {
    padding-top: 0 !important;
  }
  :fullscreen header,
  :-webkit-full-screen header {
    top: 0 !important;
  }

  /* Bar Sections */
  .cr-section {
    display: flex !important;
    align-items: center !important;
    gap: 8px !important;
  }

  /* Segmented Nav Capsule (Back / Forward) */
  .cr-nav-group {
    display: inline-flex !important;
    align-items: center !important;
    background: rgba(255, 255, 255, 0.05) !important;
    border: 1px solid var(--cr-border) !important;
    border-radius: 8px !important;
    padding: 2px !important;
    gap: 1px !important;
  }

  .cr-nav-group-btn {
    background: transparent !important;
    border: none !important;
    color: var(--cr-text) !important;
    padding: 4px 8px !important;
    border-radius: 6px !important;
    cursor: pointer !important;
    display: inline-flex !important;
    align-items: center !important;
    gap: 4px !important;
    font-size: 12px !important;
    font-weight: 600 !important;
    transition: all 0.15s ease !important;
  }

  .cr-nav-group-btn:hover:not(:disabled) {
    background: var(--cr-bg-hover) !important;
    color: var(--cr-accent) !important;
  }

  .cr-nav-group-btn:active:not(:disabled) {
    transform: scale(0.95) !important;
  }

  .cr-nav-group-btn:disabled {
    opacity: 0.25 !important;
    cursor: not-allowed !important;
  }

  .cr-nav-divider {
    width: 1px !important;
    height: 14px !important;
    background: var(--cr-border) !important;
    margin: 0 1px !important;
  }

  /* Single Action Buttons */
  .cr-icon-btn {
    background: rgba(255, 255, 255, 0.05) !important;
    border: 1px solid var(--cr-border) !important;
    color: var(--cr-text) !important;
    padding: 5px 9px !important;
    border-radius: 8px !important;
    cursor: pointer !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 6px !important;
    font-size: 12px !important;
    font-weight: 500 !important;
    transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1) !important;
  }

  .cr-icon-btn:hover {
    background: var(--cr-bg-hover) !important;
    border-color: var(--cr-border-hover) !important;
    color: #ffffff !important;
    transform: translateY(-1px) !important;
  }

  .cr-icon-btn:active {
    transform: scale(0.96) !important;
  }

  /* Discovery Quick Pills */
  .cr-tab-link {
    background: transparent !important;
    border: 1px solid transparent !important;
    color: var(--cr-text-dim) !important;
    padding: 5px 11px !important;
    border-radius: 20px !important;
    font-size: 12px !important;
    font-weight: 600 !important;
    cursor: pointer !important;
    display: inline-flex !important;
    align-items: center !important;
    gap: 6px !important;
    transition: all 0.15s ease !important;
  }

  .cr-tab-link:hover {
    color: var(--cr-text) !important;
    background: rgba(255, 255, 255, 0.06) !important;
  }

  .cr-tab-link:active {
    transform: scale(0.96) !important;
  }

  /* Status Badges */
  .cr-badge-btn {
    background: rgba(255, 255, 255, 0.05) !important;
    border: 1px solid var(--cr-border) !important;
    color: var(--cr-text) !important;
    padding: 4px 10px !important;
    border-radius: 20px !important;
    font-size: 11px !important;
    font-weight: 600 !important;
    cursor: pointer !important;
    display: inline-flex !important;
    align-items: center !important;
    gap: 6px !important;
    transition: all 0.18s ease !important;
  }

  .cr-badge-btn:hover {
    border-color: var(--cr-border-hover) !important;
    background: var(--cr-bg-hover) !important;
  }

  .cr-badge-btn.active {
    background: var(--cr-bg-active) !important;
    border-color: rgba(255, 100, 0, 0.4) !important;
    color: var(--cr-accent) !important;
  }

  .cr-dot {
    width: 6px !important;
    height: 6px !important;
    border-radius: 50% !important;
    background: var(--cr-text-dim) !important;
    transition: background 0.2s ease, box-shadow 0.2s ease !important;
  }

  .cr-badge-btn.active .cr-dot {
    background: #00e676 !important;
    box-shadow: 0 0 8px #00e676 !important;
  }

  /* Collapse Handle */
  .cr-collapse-handle {
    position: absolute !important;
    bottom: -16px !important;
    right: 32px !important;
    background: var(--cr-bg) !important;
    border: 1px solid var(--cr-border) !important;
    border-top: none !important;
    border-radius: 0 0 8px 8px !important;
    padding: 1px 10px !important;
    cursor: pointer !important;
    color: var(--cr-text-dim) !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    backdrop-filter: blur(20px) !important;
    transition: color 0.15s ease, background 0.15s ease !important;
    z-index: 2147483647 !important;
  }

  .cr-collapse-handle:hover {
    color: var(--cr-accent) !important;
    background: var(--cr-bg-card) !important;
  }

  /* Elegant Setup / Preferences Modal */
  #cr-modal-overlay {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    background: rgba(0, 0, 0, 0.72) !important;
    backdrop-filter: blur(16px) !important;
    -webkit-backdrop-filter: blur(16px) !important;
    z-index: 2147483647 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    font-family: var(--cr-font) !important;
    animation: crFadeIn 0.22s cubic-bezier(0.16, 1, 0.3, 1) !important;
  }

  @keyframes crFadeIn {
    from { opacity: 0; transform: scale(0.97); }
    to { opacity: 1; transform: scale(1); }
  }

  .cr-modal-card {
    background: var(--cr-bg-card) !important;
    color: var(--cr-text) !important;
    border: 1px solid var(--cr-border) !important;
    border-radius: 18px !important;
    width: 90% !important;
    max-width: 480px !important;
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05) !important;
    overflow: hidden !important;
  }

  .cr-modal-header {
    padding: 22px 24px 16px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    border-bottom: 1px solid var(--cr-border) !important;
  }

  .cr-modal-title {
    display: flex !important;
    align-items: center !important;
    gap: 10px !important;
    font-size: 17px !important;
    font-weight: 700 !important;
    color: var(--cr-text) !important;
  }

  .cr-modal-close {
    background: transparent !important;
    border: none !important;
    color: var(--cr-text-dim) !important;
    font-size: 18px !important;
    cursor: pointer !important;
    padding: 4px 8px !important;
    border-radius: 8px !important;
    transition: all 0.15s ease !important;
  }

  .cr-modal-close:hover {
    color: var(--cr-text) !important;
    background: var(--cr-bg-hover) !important;
  }

  .cr-modal-body {
    padding: 20px 24px !important;
  }

  .cr-row {
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    padding: 12px 0 !important;
    border-bottom: 1px solid var(--cr-border) !important;
  }

  .cr-row:last-child {
    border-bottom: none !important;
  }

  .cr-row-info h4 {
    margin: 0 0 3px 0 !important;
    font-size: 13.5px !important;
    font-weight: 600 !important;
  }

  .cr-row-info p {
    margin: 0 !important;
    font-size: 12px !important;
    color: var(--cr-text-dim) !important;
  }

  .cr-shortcut-tag {
    background: rgba(255, 255, 255, 0.07) !important;
    padding: 2px 7px !important;
    border-radius: 6px !important;
    border: 1px solid var(--cr-border) !important;
    font-family: monospace !important;
    font-size: 11px !important;
    color: var(--cr-accent) !important;
    font-weight: 600 !important;
  }

  .cr-modal-footer {
    padding: 14px 24px !important;
    background: rgba(0, 0, 0, 0.2) !important;
    display: flex !important;
    justify-content: flex-end !important;
    border-top: 1px solid var(--cr-border) !important;
  }

  .cr-primary-btn {
    background: var(--cr-accent) !important;
    color: #ffffff !important;
    border: none !important;
    border-radius: 8px !important;
    padding: 9px 18px !important;
    font-weight: 600 !important;
    font-size: 13px !important;
    cursor: pointer !important;
    transition: all 0.15s ease !important;
  }

  .cr-primary-btn:hover {
    background: var(--cr-accent-hover) !important;
    box-shadow: 0 4px 14px var(--cr-accent-glow) !important;
  }
`;

// Initialize Theme
function applyTheme(isDark) {
  currentTheme = isDark ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', currentTheme);
  const themeBtn = document.getElementById('cr-theme-btn');
  if (themeBtn) {
    themeBtn.innerHTML = `${isDark ? ICONS.moon : ICONS.sun}`;
  }
}

// IPC theme info
ipcRenderer.invoke('get-theme-info').then(info => {
  if (info) applyTheme(info.shouldUseDarkColors);
}).catch(() => {});

ipcRenderer.on('theme-changed', (event, info) => {
  if (info) applyTheme(info.shouldUseDarkColors);
});

// Update navigation buttons status
function updateNavButtons(state) {
  if (!state) return;
  navState = state;
  const backBtn = document.getElementById('cr-nav-back');
  const forwardBtn = document.getElementById('cr-nav-forward');
  if (backBtn && typeof state.canGoBack === 'boolean') {
    backBtn.disabled = !state.canGoBack;
  }
  if (forwardBtn && typeof state.canGoForward === 'boolean') {
    forwardBtn.disabled = !state.canGoForward;
  }
}

ipcRenderer.on('nav-state-changed', (event, state) => {
  if (state) updateNavButtons(state);
});

// Inject styles
function injectStyles() {
  if (document.getElementById('cr-custom-styles')) return;
  const styleEl = document.createElement('style');
  styleEl.id = 'cr-custom-styles';
  styleEl.innerText = customStyles;
  const target = document.head || document.documentElement;
  if (target) target.appendChild(styleEl);
}

// Open Preferences Modal
function openPreferencesModal() {
  if (document.getElementById('cr-modal-overlay')) return;

  const modal = document.createElement('div');
  modal.id = 'cr-modal-overlay';
  modal.innerHTML = `
    <div class="cr-modal-card">
      <div class="cr-modal-header">
        <div class="cr-modal-title">
          <span>🎬</span>
          <span>Crunchyroll Preferences</span>
        </div>
        <button class="cr-modal-close" id="cr-modal-close-btn">✕</button>
      </div>

      <div class="cr-modal-body">
        <div class="cr-row">
          <div class="cr-row-info">
            <h4>Widevine DRM Decryption</h4>
            <p>Hardware-accelerated CDM media pipeline</p>
          </div>
          <span style="color: #00e676; font-weight: 600; font-size: 12px; display: flex; align-items: center; gap: 5px;">
            <span style="width: 7px; height: 7px; background: #00e676; border-radius: 50%; box-shadow: 0 0 6px #00e676;"></span>
            Active
          </span>
        </div>

        <div class="cr-row">
          <div class="cr-row-info">
            <h4>Auto-Skip Intros & Recaps</h4>
            <p>Automatically click skip buttons when available</p>
          </div>
          <button class="cr-badge-btn ${autoSkipEnabled ? 'active' : ''}" id="cr-modal-skip-toggle">
            <span class="cr-dot"></span>
            <span>${autoSkipEnabled ? 'Enabled' : 'Disabled'}</span>
          </button>
        </div>

        <div class="cr-row">
          <div class="cr-row-info">
            <h4>Appearance Theme</h4>
            <p>Synchronize with system dark/light mode</p>
          </div>
          <button class="cr-icon-btn" id="cr-modal-theme-toggle">
            ${currentTheme === 'dark' ? ICONS.moon + ' Dark' : ICONS.sun + ' Light'}
          </button>
        </div>

        <div style="margin-top: 18px;">
          <h4 style="margin: 0 0 8px 0; font-size: 12px; color: var(--cr-text-dim); text-transform: uppercase; letter-spacing: 0.5px;">Keybindings</h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px;">
            <div><span class="cr-shortcut-tag">Alt + ←</span> / <span class="cr-shortcut-tag">Alt + →</span> Nav</div>
            <div><span class="cr-shortcut-tag">[</span> / <span class="cr-shortcut-tag">]</span> Speed</div>
            <div><span class="cr-shortcut-tag">P</span> Picture-in-Picture</div>
            <div><span class="cr-shortcut-tag">Space</span> Play/Pause</div>
          </div>
        </div>
      </div>

      <div class="cr-modal-footer">
        <button class="cr-primary-btn" id="cr-modal-done-btn">Done</button>
      </div>
    </div>
  `;

  const target = document.body || document.documentElement;
  if (target) target.appendChild(modal);

  const closeModal = () => {
    localStorage.setItem('cr_setup_completed_v1', 'true');
    modal.remove();
  };

  document.getElementById('cr-modal-close-btn').addEventListener('click', closeModal);
  document.getElementById('cr-modal-done-btn').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  const modalSkipBtn = document.getElementById('cr-modal-skip-toggle');
  modalSkipBtn.addEventListener('click', () => {
    autoSkipEnabled = !autoSkipEnabled;
    modalSkipBtn.classList.toggle('active', autoSkipEnabled);
    modalSkipBtn.querySelector('span:last-child').textContent = autoSkipEnabled ? 'Enabled' : 'Disabled';
    const barSkipBtn = document.getElementById('cr-auto-skip-btn');
    if (barSkipBtn) {
      barSkipBtn.classList.toggle('active', autoSkipEnabled);
      barSkipBtn.querySelector('span:last-child').textContent = autoSkipEnabled ? 'Skip: ON' : 'Skip: OFF';
    }
  });

  const modalThemeBtn = document.getElementById('cr-modal-theme-toggle');
  modalThemeBtn.addEventListener('click', () => {
    applyTheme(currentTheme !== 'dark');
    modalThemeBtn.innerHTML = `${currentTheme === 'dark' ? ICONS.moon + ' Dark' : ICONS.sun + ' Light'}`;
  });
}

// Create and Inject the App Bar
function createAppBar() {
  const target = document.body || document.documentElement;
  if (!target) return;

  let bar = document.getElementById('cr-app-bar');
  if (bar) {
    if (!target.contains(bar)) target.appendChild(bar);
    return;
  }

  bar = document.createElement('div');
  bar.id = 'cr-app-bar';
  bar.innerHTML = `
    <!-- Left Navigation: Segmented Back/Forward, Reload, Home -->
    <div class="cr-section">
      <div class="cr-nav-group">
        <button class="cr-nav-group-btn" id="cr-nav-back" title="Back (Alt+Left)">
          ${ICONS.back} <span>Back</span>
        </button>
        <div class="cr-nav-divider"></div>
        <button class="cr-nav-group-btn" id="cr-nav-forward" title="Forward (Alt+Right)">
          <span>Forward</span> ${ICONS.forward}
        </button>
      </div>

      <button class="cr-icon-btn" id="cr-nav-reload" title="Refresh (Ctrl+R)">
        ${ICONS.reload}
      </button>

      <button class="cr-icon-btn" id="cr-nav-home" title="Crunchyroll Home">
        ${ICONS.home}
      </button>
    </div>

    <!-- Center Quick Navigation Tabs -->
    <div class="cr-section">
      <button class="cr-tab-link" id="cr-quick-browse">
        ${ICONS.explore} <span>Explore</span>
      </button>
      <button class="cr-tab-link" id="cr-quick-simulcasts">
        ${ICONS.simulcast} <span>Simulcasts</span>
      </button>
      <button class="cr-tab-link" id="cr-quick-watchlist">
        ${ICONS.watchlist} <span>Watchlist</span>
      </button>
    </div>

    <!-- Right Controls: Auto-Skip, Speed, PiP, Theme, Settings -->
    <div class="cr-section">
      <button class="cr-badge-btn ${autoSkipEnabled ? 'active' : ''}" id="cr-auto-skip-btn" title="Toggle Auto-Skip Intro/Recap">
        <span class="cr-dot"></span>
        <span>${autoSkipEnabled ? 'Skip: ON' : 'Skip: OFF'}</span>
      </button>

      <button class="cr-icon-btn" id="cr-speed-btn" title="Cycle Playback Speed">
        ${ICONS.speed} <span id="cr-speed-text">1.0x</span>
      </button>

      <button class="cr-icon-btn" id="cr-pip-btn" title="Picture-in-Picture">
        ${ICONS.pip}
      </button>

      <button class="cr-icon-btn" id="cr-theme-btn" title="Toggle Theme">
        ${currentTheme === 'dark' ? ICONS.moon : ICONS.sun}
      </button>

      <button class="cr-icon-btn" id="cr-settings-btn" title="Preferences">
        ${ICONS.settings}
      </button>
    </div>

    <!-- Collapse / Expand Pill -->
    <div class="cr-collapse-handle" id="cr-collapse-btn" title="Toggle Toolbar">
      ${ICONS.chevronUp}
    </div>
  `;

  target.appendChild(bar);

  // Initial nav check
  ipcRenderer.invoke('get-nav-state').then(state => {
    if (state) updateNavButtons(state);
  }).catch(() => {});

  // Hook Settings Button
  document.getElementById('cr-settings-btn').addEventListener('click', openPreferencesModal);

  // Hook Navigation
  document.getElementById('cr-nav-back').addEventListener('click', () => ipcRenderer.send('nav-back'));
  document.getElementById('cr-nav-forward').addEventListener('click', () => ipcRenderer.send('nav-forward'));
  document.getElementById('cr-nav-reload').addEventListener('click', () => ipcRenderer.send('nav-reload'));
  document.getElementById('cr-nav-home').addEventListener('click', () => ipcRenderer.send('nav-home'));

  // Hook Quick Tabs
  document.getElementById('cr-quick-browse').addEventListener('click', () => {
    ipcRenderer.send('nav-url', 'https://www.crunchyroll.com/videos/popular');
  });
  document.getElementById('cr-quick-simulcasts').addEventListener('click', () => {
    ipcRenderer.send('nav-url', 'https://www.crunchyroll.com/simulcasts');
  });
  document.getElementById('cr-quick-watchlist').addEventListener('click', () => {
    ipcRenderer.send('nav-url', 'https://www.crunchyroll.com/watchlist');
  });

  // Hook Auto-Skip
  const autoSkipBtn = document.getElementById('cr-auto-skip-btn');
  autoSkipBtn.addEventListener('click', () => {
    autoSkipEnabled = !autoSkipEnabled;
    autoSkipBtn.classList.toggle('active', autoSkipEnabled);
    autoSkipBtn.querySelector('span:last-child').textContent = autoSkipEnabled ? 'Skip: ON' : 'Skip: OFF';
    showToast(`Auto-Skip: ${autoSkipEnabled ? 'ON' : 'OFF'}`);
  });

  // Hook Speed
  const speedBtn = document.getElementById('cr-speed-btn');
  speedBtn.addEventListener('click', () => {
    const speeds = [1.0, 1.25, 1.5, 2.0, 0.75];
    const current = window.__crPlaybackRate || 1.0;
    let nextIdx = speeds.indexOf(current) + 1;
    if (nextIdx >= speeds.length || nextIdx === 0) nextIdx = 0;
    const nextRate = speeds[nextIdx];
    window.__crPlaybackRate = nextRate;
    getActiveVideos().forEach(v => {
      v.playbackRate = nextRate;
      v.defaultPlaybackRate = nextRate;
    });
    document.getElementById('cr-speed-text').textContent = `${nextRate}x`;
    showToast(`Speed: ${nextRate}x`);
  });

  // Hook PiP
  document.getElementById('cr-pip-btn').addEventListener('click', triggerPictureInPicture);

  // Hook Theme Toggle directly
  document.getElementById('cr-theme-btn').addEventListener('click', () => {
    applyTheme(currentTheme !== 'dark');
  });

  // Toggle Collapse
  const collapseBtn = document.getElementById('cr-collapse-btn');
  collapseBtn.addEventListener('click', () => {
    isAppBarCollapsed = !isAppBarCollapsed;
    bar.classList.toggle('collapsed', isAppBarCollapsed);
    collapseBtn.innerHTML = isAppBarCollapsed ? ICONS.chevronDown : ICONS.chevronUp;
  });

  updateNavButtons(navState);
}

// Continuous DOM Guardian to ensure App Bar is always present in document.body
function ensureAppBar() {
  injectStyles();
  const root = document.body || document.documentElement;
  if (!root) return;

  let bar = document.getElementById('cr-app-bar');
  if (!bar) {
    createAppBar();
  } else if (document.body && bar.parentElement !== document.body) {
    document.body.appendChild(bar);
  }
}

// Robust Picture-in-Picture trigger (Native PiP + Floating Mini-Player Fallback)
async function triggerPictureInPicture() {
  const videos = getActiveVideos();
  const video = videos.find(v => !v.paused) || videos[0];

  // 1. If native PiP is currently active, exit it
  if (document.pictureInPictureElement) {
    try {
      await document.exitPictureInPicture();
      showToast('PiP: Off');
      return;
    } catch (e) {}
  }

  // 2. Try native HTML5 Picture-in-Picture
  if (video) {
    try {
      video.disablePictureInPicture = false;
      video.removeAttribute('disablepictureinpicture');
      if (typeof video.requestPictureInPicture === 'function') {
        await video.requestPictureInPicture();
        showToast('Picture-in-Picture: ON');
        return;
      }
    } catch (err) {
      console.warn('Native HTML5 PiP unavailable or blocked by DRM, activating Floating Mini-Player:', err);
    }
  }

  // 3. Fallback: Native Floating Mini-Player Window
  try {
    const isMini = await ipcRenderer.invoke('toggle-pip-window');
    showToast(isMini ? 'Floating Mini-Player: ON' : 'Mini-Player: OFF');
  } catch (e) {
    showToast('No active video found');
  }
}

// Global Keydown Handler
function handleGlobalKeyDown(e) {
  const activeEl = document.activeElement;
  const isInput = activeEl && (
    activeEl.tagName === 'INPUT' ||
    activeEl.tagName === 'TEXTAREA' ||
    activeEl.isContentEditable ||
    activeEl.getAttribute('role') === 'textbox'
  );

  // Back / Forward Keyboard Shortcuts
  if (e.altKey && e.key === 'ArrowLeft') {
    e.preventDefault();
    ipcRenderer.send('nav-back');
    return;
  }
  if (e.altKey && e.key === 'ArrowRight') {
    e.preventDefault();
    ipcRenderer.send('nav-forward');
    return;
  }

  if (isInput) return;

  const videos = getActiveVideos();
  const video = videos.length > 0 ? videos[0] : null;

  // Decrease speed: '['
  if (e.key === '[' || e.code === 'BracketLeft') {
    e.stopImmediatePropagation();
    e.preventDefault();
    const current = window.__crPlaybackRate || (video ? video.playbackRate : 1.0);
    const newRate = Math.max(0.25, parseFloat((current - 0.25).toFixed(2)));
    window.__crPlaybackRate = newRate;
    videos.forEach(v => {
      v.playbackRate = newRate;
      v.defaultPlaybackRate = newRate;
    });
    const speedText = document.getElementById('cr-speed-text');
    if (speedText) speedText.textContent = `${newRate}x`;
    showToast(`Speed: ${newRate}x`);
    return;
  }

  // Increase speed: ']'
  if (e.key === ']' || e.code === 'BracketRight') {
    e.stopImmediatePropagation();
    e.preventDefault();
    const current = window.__crPlaybackRate || (video ? video.playbackRate : 1.0);
    const newRate = Math.min(3.0, parseFloat((current + 0.25).toFixed(2)));
    window.__crPlaybackRate = newRate;
    videos.forEach(v => {
      v.playbackRate = newRate;
      v.defaultPlaybackRate = newRate;
    });
    const speedText = document.getElementById('cr-speed-text');
    if (speedText) speedText.textContent = `${newRate}x`;
    showToast(`Speed: ${newRate}x`);
    return;
  }

  // Picture-in-Picture: 'P' or 'p'
  if ((e.key === 'p' || e.key === 'P' || e.code === 'KeyP') && !e.ctrlKey && !e.metaKey && !e.altKey) {
    e.stopImmediatePropagation();
    e.preventDefault();
    triggerPictureInPicture();
    return;
  }
}

// Global event listeners
window.addEventListener('keydown', handleGlobalKeyDown, true);
document.addEventListener('keydown', handleGlobalKeyDown, true);

// Run initial injection
ensureAppBar();

window.addEventListener('DOMContentLoaded', () => {
  ensureAppBar();
  const videos = getActiveVideos();
  videos.forEach(attachVideoListeners);
});

window.addEventListener('load', () => {
  ensureAppBar();
});

// Periodic observer
setInterval(() => {
  ensureAppBar();
  const videos = getActiveVideos();
  videos.forEach(attachVideoListeners);
  checkAndAutoSkip();
}, 400);
