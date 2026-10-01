const { ipcRenderer } = require('electron');

let currentTheme = 'dark';
let autoSkipEnabled = true;
let autoNextEnabled = true;
let isAppBarCollapsed = false;
let currentShader = localStorage.getItem('cr_anime_shader') || 'default';
let navState = { canGoBack: false, canGoForward: false };

// SVG Icon Pack (Minimalist, crisp vector icons)
const ICONS = {
  back: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>`,
  forward: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`,
  reload: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3"/></svg>`,
  home: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  search: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  explore: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>`,
  simulcast: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  watchlist: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>`,
  zap: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  speed: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  pip: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><rect x="12" y="10" width="8" height="6" rx="1"/></svg>`,
  palette: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>`,
  moon: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`,
  sun: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>`,
  settings: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  chevronUp: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>`,
  chevronDown: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`
};

// Shaders mapping
const SHADERS = {
  default: { name: 'Natural', filter: 'none' },
  vibrant: { name: 'Vibrant Anime', filter: 'saturate(1.35) contrast(1.1) brightness(1.02)' },
  crisp: { name: 'Crisp Detail', filter: 'contrast(1.2) saturate(1.12) brightness(0.98)' },
  oled: { name: 'Cinematic OLED', filter: 'contrast(1.25) brightness(0.94) saturate(1.1)' },
  retro: { name: 'Warm Retro', filter: 'sepia(0.2) saturate(1.2) contrast(1.08)' }
};

// Custom CSS Injection for modern desktop experience
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

  /* Page Layout Offset to seamlessly integrate App Bar */
  body {
    padding-top: 34px !important;
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

  /* Top App Bar Glass Container - Ultra Slim & Integrated */
  #cr-app-bar {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    height: 34px !important;
    background: var(--cr-bg) !important;
    color: var(--cr-text) !important;
    border-bottom: 1px solid var(--cr-border) !important;
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    padding: 0 12px !important;
    box-sizing: border-box !important;
    z-index: 2147483647 !important;
    font-family: var(--cr-font) !important;
    font-size: 12px !important;
    user-select: none !important;
    backdrop-filter: blur(24px) saturate(180%) !important;
    -webkit-backdrop-filter: blur(24px) saturate(180%) !important;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2) !important;
    transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), background 0.3s ease !important;
    opacity: 1 !important;
    visibility: visible !important;
  }

  #cr-app-bar.collapsed {
    transform: translateY(-32px) !important;
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

  /* Bar Sections */
  .cr-section {
    display: flex !important;
    align-items: center !important;
    gap: 6px !important;
  }

  /* Segmented Nav Capsule (Back / Forward) */
  .cr-nav-group {
    display: inline-flex !important;
    align-items: center !important;
    background: rgba(255, 255, 255, 0.05) !important;
    border: 1px solid var(--cr-border) !important;
    border-radius: 6px !important;
    padding: 1px !important;
    gap: 1px !important;
  }

  .cr-nav-group-btn {
    background: transparent !important;
    border: none !important;
    color: var(--cr-text) !important;
    padding: 2px 6px !important;
    border-radius: 4px !important;
    cursor: pointer !important;
    display: inline-flex !important;
    align-items: center !important;
    gap: 3px !important;
    font-size: 11px !important;
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
    height: 12px !important;
    background: var(--cr-border) !important;
    margin: 0 1px !important;
  }

  /* Single Action Buttons */
  .cr-icon-btn {
    background: rgba(255, 255, 255, 0.05) !important;
    border: 1px solid var(--cr-border) !important;
    color: var(--cr-text) !important;
    padding: 3px 7px !important;
    border-radius: 6px !important;
    cursor: pointer !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 4px !important;
    font-size: 11.5px !important;
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
    padding: 3px 8px !important;
    border-radius: 14px !important;
    font-size: 11.5px !important;
    font-weight: 600 !important;
    cursor: pointer !important;
    display: inline-flex !important;
    align-items: center !important;
    gap: 4px !important;
    transition: all 0.15s ease !important;
  }

  .cr-tab-link:hover {
    color: var(--cr-text) !important;
    background: rgba(255, 255, 255, 0.06) !important;
  }

  /* Status Badges */
  .cr-badge-btn {
    background: rgba(255, 255, 255, 0.05) !important;
    border: 1px solid var(--cr-border) !important;
    color: var(--cr-text) !important;
    padding: 3px 8px !important;
    border-radius: 14px !important;
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

  /* Command Palette Modal */
  #cr-command-palette {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    background: rgba(0, 0, 0, 0.75) !important;
    backdrop-filter: blur(16px) !important;
    -webkit-backdrop-filter: blur(16px) !important;
    z-index: 2147483647 !important;
    display: flex !important;
    align-items: flex-start !important;
    justify-content: center !important;
    padding-top: 14vh !important;
    font-family: var(--cr-font) !important;
    animation: crFadeIn 0.18s ease !important;
  }

  .cr-palette-card {
    background: var(--cr-bg-card) !important;
    color: var(--cr-text) !important;
    border: 1px solid var(--cr-border) !important;
    border-radius: 16px !important;
    width: 90% !important;
    max-width: 580px !important;
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(255, 255, 255, 0.08) !important;
    overflow: hidden !important;
  }

  .cr-palette-input-box {
    display: flex !important;
    align-items: center !important;
    gap: 12px !important;
    padding: 16px 20px !important;
    border-bottom: 1px solid var(--cr-border) !important;
  }

  .cr-palette-input {
    flex: 1 !important;
    background: transparent !important;
    border: none !important;
    outline: none !important;
    font-size: 16px !important;
    font-weight: 500 !important;
    color: #ffffff !important;
    font-family: var(--cr-font) !important;
  }

  .cr-palette-list {
    max-height: 340px !important;
    overflow-y: auto !important;
    padding: 8px !important;
  }

  .cr-palette-item {
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    padding: 10px 14px !important;
    border-radius: 10px !important;
    cursor: pointer !important;
    font-size: 13.5px !important;
    color: var(--cr-text) !important;
    transition: all 0.12s ease !important;
  }

  .cr-palette-item:hover, .cr-palette-item.selected {
    background: var(--cr-bg-hover) !important;
    color: var(--cr-accent) !important;
  }

  .cr-shortcut-tag {
    background: rgba(255, 255, 255, 0.08) !important;
    padding: 2px 7px !important;
    border-radius: 6px !important;
    border: 1px solid var(--cr-border) !important;
    font-family: monospace !important;
    font-size: 11px !important;
    color: var(--cr-accent) !important;
    font-weight: 600 !important;
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

// Apply Shader to Video
function applyShader(shaderKey) {
  const shader = SHADERS[shaderKey] || SHADERS.default;
  currentShader = shaderKey;
  localStorage.setItem('cr_anime_shader', shaderKey);

  const videos = getActiveVideos();
  videos.forEach(v => {
    v.style.filter = shader.filter;
  });

  const shaderText = document.getElementById('cr-shader-text');
  if (shaderText) shaderText.textContent = shader.name;
  showToast(`Shader: ${shader.name}`);
}

// Inject styles
function injectStyles() {
  if (document.getElementById('cr-custom-styles')) return;
  const styleEl = document.createElement('style');
  styleEl.id = 'cr-custom-styles';
  styleEl.innerText = customStyles;
  const target = document.head || document.documentElement;
  if (target) target.appendChild(styleEl);
}

// Open Spotlight Command Palette (Ctrl+K)
function openCommandPalette() {
  if (document.getElementById('cr-command-palette')) return;

  const palette = document.createElement('div');
  palette.id = 'cr-command-palette';
  palette.innerHTML = `
    <div class="cr-palette-card">
      <div class="cr-palette-input-box">
        ${ICONS.search}
        <input type="text" class="cr-palette-input" id="cr-search-input" placeholder="Search anime, episodes, or quick actions..." autofocus autocomplete="off" />
        <span class="cr-shortcut-tag">ESC</span>
      </div>
      <div class="cr-palette-list" id="cr-palette-results">
        <div class="cr-palette-item" data-action="explore">
          <span>🍿 Explore Popular Anime</span>
          <span class="cr-shortcut-tag">Jump</span>
        </div>
        <div class="cr-palette-item" data-action="simulcasts">
          <span>📅 Seasonal Simulcasts</span>
          <span class="cr-shortcut-tag">Jump</span>
        </div>
        <div class="cr-palette-item" data-action="watchlist">
          <span>🔖 My Watchlist</span>
          <span class="cr-shortcut-tag">Jump</span>
        </div>
        <div class="cr-palette-item" data-action="pip">
          <span>📺 Toggle Picture-in-Picture</span>
          <span class="cr-shortcut-tag">P</span>
        </div>
        <div class="cr-palette-item" data-action="shader">
          <span>🎨 Cycle Anime Shader Preset</span>
          <span class="cr-shortcut-tag">Shader</span>
        </div>
        <div class="cr-palette-item" data-action="skip">
          <span>⚡ Toggle Auto-Skip Intro & Recap</span>
          <span class="cr-shortcut-tag">${autoSkipEnabled ? 'ON' : 'OFF'}</span>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(palette);
  const input = document.getElementById('cr-search-input');
  input.focus();

  const closePalette = () => palette.remove();

  palette.addEventListener('click', (e) => {
    if (e.target === palette) closePalette();
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closePalette();
    } else if (e.key === 'Enter') {
      const q = input.value.trim();
      if (q) {
        closePalette();
        ipcRenderer.send('nav-url', `https://www.crunchyroll.com/search?q=${encodeURIComponent(q)}`);
      }
    }
  });

  // Action clicks
  palette.querySelectorAll('.cr-palette-item').forEach(item => {
    item.addEventListener('click', () => {
      const action = item.dataset.action;
      closePalette();
      if (action === 'explore') ipcRenderer.send('nav-url', 'https://www.crunchyroll.com/videos/popular');
      if (action === 'simulcasts') ipcRenderer.send('nav-url', 'https://www.crunchyroll.com/simulcasts');
      if (action === 'watchlist') ipcRenderer.send('nav-url', 'https://www.crunchyroll.com/watchlist');
      if (action === 'pip') triggerPictureInPicture();
      if (action === 'shader') cycleShader();
      if (action === 'skip') {
        autoSkipEnabled = !autoSkipEnabled;
        showToast(`Auto-Skip: ${autoSkipEnabled ? 'ON' : 'OFF'}`);
      }
    });
  });
}

function cycleShader() {
  const keys = Object.keys(SHADERS);
  let idx = keys.indexOf(currentShader) + 1;
  if (idx >= keys.length) idx = 0;
  applyShader(keys[idx]);
}

// Create and Inject the App Bar
function createAppBar() {
  if (!document.body) return;

  let bar = document.getElementById('cr-app-bar');
  if (bar) {
    if (bar.parentElement !== document.body) {
      document.body.appendChild(bar);
    }
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

      <button class="cr-icon-btn" id="cr-spotlight-btn" title="Command Palette & Search (Ctrl+K)">
        ${ICONS.search} <span style="font-size:11px;opacity:0.8;">Ctrl+K</span>
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

    <!-- Right Controls: Auto-Skip, Shaders, Speed, PiP, Theme -->
    <div class="cr-section">
      <button class="cr-badge-btn ${autoSkipEnabled ? 'active' : ''}" id="cr-auto-skip-btn" title="Toggle Auto-Skip Intro/Recap">
        <span class="cr-dot"></span>
        <span>${autoSkipEnabled ? 'Skip: ON' : 'Skip: OFF'}</span>
      </button>

      <button class="cr-icon-btn" id="cr-shader-btn" title="Anime Video Shaders">
        ${ICONS.palette} <span id="cr-shader-text">${SHADERS[currentShader] ? SHADERS[currentShader].name : 'Shaders'}</span>
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
    </div>

    <!-- Collapse / Expand Pill -->
    <div class="cr-collapse-handle" id="cr-collapse-btn" title="Toggle Toolbar">
      ${ICONS.chevronUp}
    </div>
  `;

  document.body.appendChild(bar);

  // Initial nav check
  ipcRenderer.invoke('get-nav-state').then(state => {
    if (state) updateNavButtons(state);
  }).catch(() => {});

  // Hook Spotlight Button
  document.getElementById('cr-spotlight-btn').addEventListener('click', openCommandPalette);

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

  // Hook Shader Cycle
  document.getElementById('cr-shader-btn').addEventListener('click', cycleShader);

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

  // Hook Theme Toggle
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

// Continuous DOM Guardian
function ensureAppBar() {
  injectStyles();
  if (!document.body) return;

  let bar = document.getElementById('cr-app-bar');
  if (!bar) {
    createAppBar();
  } else if (bar.parentElement !== document.body) {
    document.body.appendChild(bar);
  }
}

// Sleek Toast Indicator
function showToast(text) {
  let toast = document.getElementById('cr-toast-indicator');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'cr-toast-indicator';
    toast.style.cssText = `
      position: fixed !important;
      top: 54px !important;
      right: 24px !important;
      background: rgba(20, 22, 28, 0.94) !important;
      color: #ffffff !important;
      padding: 8px 16px !important;
      border-radius: 10px !important;
      font-size: 13px !important;
      font-weight: 600 !important;
      border: 1px solid rgba(255, 100, 0, 0.5) !important;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6), 0 0 12px rgba(255, 100, 0, 0.2) !important;
      z-index: 2147483647 !important;
      pointer-events: none !important;
      transition: opacity 0.25s ease, transform 0.25s ease !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
      backdrop-filter: blur(16px) !important;
    `;
    if (document.body) document.body.appendChild(toast);
  }
  toast.innerText = text;
  toast.style.opacity = '1';
  toast.style.transform = 'translateY(0)';

  clearTimeout(window.__crToastTimeout);
  window.__crToastTimeout = setTimeout(() => {
    if (toast) {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-4px)';
    }
  }, 1200);
}

// Video elements query (Optimized, non-blocking)
function getActiveVideos() {
  try {
    const directVideos = Array.from(document.querySelectorAll('video'));
    if (directVideos.length > 0) {
      directVideos.forEach(v => {
        try {
          v.disablePictureInPicture = false;
          v.removeAttribute('disablepictureinpicture');
          if (SHADERS[currentShader]) v.style.filter = SHADERS[currentShader].filter;
        } catch (e) {}
      });
      directVideos.sort((a, b) => (!b.paused ? 1 : 0) - (!a.paused ? 1 : 0));
      return directVideos;
    }
    
    // Check shadow DOM on common player containers only
    const playerContainers = document.querySelectorAll('[class*="video-player"], [class*="player"], [id*="player"]');
    for (let i = 0; i < playerContainers.length; i++) {
      const el = playerContainers[i];
      if (el.shadowRoot) {
        const shadowVideos = Array.from(el.shadowRoot.querySelectorAll('video'));
        if (shadowVideos.length > 0) {
          shadowVideos.forEach(v => {
            try {
              v.disablePictureInPicture = false;
              v.removeAttribute('disablepictureinpicture');
              if (SHADERS[currentShader]) v.style.filter = SHADERS[currentShader].filter;
            } catch (e) {}
          });
          return shadowVideos;
        }
      }
    }
  } catch (e) {}
  return [];
}

// Attach playback rate and state listeners to video
function attachVideoListeners(video) {
  if (!video || video.__crAttached) return;
  video.__crAttached = true;

  if (window.__crPlaybackRate) {
    video.playbackRate = window.__crPlaybackRate;
    video.defaultPlaybackRate = window.__crPlaybackRate;
  }
  if (SHADERS[currentShader]) {
    video.style.filter = SHADERS[currentShader].filter;
  }

  const notifyState = () => {
    const isPlaying = !video.paused && !video.ended;
    try {
      ipcRenderer.send('playback-state-change', isPlaying);
    } catch (e) {}

    // Discord RPC & Media Session Sync
    syncMediaSessionAndRPC(video);
  };

  video.addEventListener('play', notifyState);
  video.addEventListener('playing', notifyState);
  video.addEventListener('pause', notifyState);
  video.addEventListener('ended', notifyState);
  video.addEventListener('timeupdate', notifyState);

  notifyState();
}

// Extract Anime Info & Sync with Discord RPC & Media Session
let lastRpcUpdate = 0;
function syncMediaSessionAndRPC(video) {
  const now = Date.now();
  if (now - lastRpcUpdate < 4000) return; // Throttle updates
  lastRpcUpdate = now;

  let title = '';
  let show = '';

  const titleEl = document.querySelector('[data-t="episode-title"], .episode-title, h1[class*="title"]');
  const showEl = document.querySelector('[data-t="show-title"], .show-title, a[class*="show-title"]');

  if (titleEl) title = (titleEl.innerText || '').trim();
  if (showEl) show = (showEl.innerText || '').trim();

  if (!title) {
    const docTitle = document.title || '';
    title = docTitle.replace(' - Watch on Crunchyroll', '').replace('Watch on Crunchyroll', '').trim();
  }

  const isPlaying = video ? (!video.paused && !video.ended) : false;
  const currentTime = video ? video.currentTime : 0;
  const duration = video ? video.duration : 0;

  // Sync with OS MediaSession (Zorin OS / GNOME widget)
  if ('mediaSession' in navigator) {
    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    navigator.mediaSession.metadata = new MediaMetadata({
      title: title || 'Crunchyroll Anime',
      artist: show || 'Crunchyroll',
      album: show || 'Crunchyroll Anime',
      artwork: [
        { src: 'https://www.crunchyroll.com/build/assets/img/favicons/favicon-512x512.png', sizes: '512x512', type: 'image/png' }
      ]
    });

    navigator.mediaSession.setActionHandler('play', () => { if (video) video.play(); });
    navigator.mediaSession.setActionHandler('pause', () => { if (video) video.pause(); });
    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (video && details.seekTime) video.currentTime = details.seekTime;
    });
  }

  // Send update to Discord RPC in main process
  ipcRenderer.send('update-discord-rpc', {
    details: show ? `${show}` : 'Watching Anime',
    state: title ? `${title}` : 'Crunchyroll Desktop',
    isPlaying: isPlaying,
    currentTime: currentTime,
    duration: duration,
    watchUrl: window.location.href
  });
}

// Auto-Skip Intro, Recap, & Auto-Next Episode (Targeted and efficient)
function checkAndAutoSkip() {
  try {
    // 1. Skip Intro / Recap
    if (autoSkipEnabled) {
      const skipBtn = document.querySelector(
        '[data-t="skip-intro-btn"], [data-t="skip-recap-btn"], [data-t="skip-button"], ' +
        '[data-testid*="skip"], button[class*="skip"], div[class*="skip"][role="button"], ' +
        '.vjs-skip-intro, .vjs-skip-recap, .skip-button'
      );
      if (skipBtn && skipBtn.offsetParent !== null && !skipBtn.disabled) {
        skipBtn.click();
        return;
      }
    }

    // 2. Smart Auto-Next Episode
    if (autoNextEnabled) {
      const nextBtn = document.querySelector(
        '[data-t="next-episode-btn"], [data-testid*="next-episode"], button[class*="next-episode"], ' +
        '.next-episode-btn, [data-t="play-next-btn"]'
      );
      if (nextBtn && nextBtn.offsetParent !== null && !nextBtn.disabled) {
        nextBtn.click();
        showToast('Auto-Playing Next Episode...');
        return;
      }
    }
  } catch (e) {}
}

// Robust Picture-in-Picture trigger (Native PiP + Floating Mini-Player Fallback)
async function triggerPictureInPicture() {
  const videos = getActiveVideos();
  const video = videos.find(v => !v.paused) || videos[0];

  if (document.pictureInPictureElement) {
    try {
      await document.exitPictureInPicture();
      showToast('PiP: Off');
      return;
    } catch (e) {}
  }

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
      console.warn('Native HTML5 PiP fallback to Floating Mini-Player:', err);
    }
  }

  try {
    const isMini = await ipcRenderer.invoke('toggle-pip-window');
    showToast(isMini ? 'Floating Mini-Player: ON' : 'Mini-Player: OFF');
  } catch (e) {
    showToast('No active video found');
  }
}

// Global Media Key IPC Handlers from Main process
ipcRenderer.on('media-play-pause', () => {
  const video = getActiveVideos()[0];
  if (video) {
    if (video.paused) video.play();
    else video.pause();
    showToast(video.paused ? '⏸ Paused' : '▶ Playing');
  }
});

ipcRenderer.on('media-next', () => {
  const nextBtn = document.querySelector('[data-t="next-episode-btn"], button[class*="next-episode"]');
  if (nextBtn) {
    nextBtn.click();
    showToast('Next Episode');
  } else {
    const video = getActiveVideos()[0];
    if (video) {
      video.currentTime += 10;
      showToast('+10s');
    }
  }
});

ipcRenderer.on('media-prev', () => {
  const video = getActiveVideos()[0];
  if (video) {
    video.currentTime = Math.max(0, video.currentTime - 10);
    showToast('-10s');
  }
});

ipcRenderer.on('media-mute', () => {
  const video = getActiveVideos()[0];
  if (video) {
    video.muted = !video.muted;
    showToast(video.muted ? '🔇 Muted' : '🔊 Unmuted');
  }
});

// Keyboard navigation and shortcuts
function handleGlobalKeyDown(e) {
  const activeEl = document.activeElement;
  const isInput = activeEl && (
    activeEl.tagName === 'INPUT' ||
    activeEl.tagName === 'TEXTAREA' ||
    activeEl.isContentEditable ||
    activeEl.getAttribute('role') === 'textbox'
  );

  // Command Palette: Ctrl+K / Cmd+K
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    openCommandPalette();
    return;
  }

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

// Initial DOM Setup
ensureAppBar();

window.addEventListener('DOMContentLoaded', () => {
  ensureAppBar();
  const videos = getActiveVideos();
  videos.forEach(attachVideoListeners);
});

window.addEventListener('load', () => {
  ensureAppBar();
});

// Periodic observer loop with lightweight check (every 1000ms instead of heavy 400ms scan)
setInterval(() => {
  ensureAppBar();
  const videos = getActiveVideos();
  videos.forEach(attachVideoListeners);
  checkAndAutoSkip();
}, 1000);



