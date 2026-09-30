const { ipcRenderer } = require('electron');

let currentTheme = 'dark';
let autoSkipEnabled = true;
let isAppBarCollapsed = false;
let navState = { canGoBack: false, canGoForward: false };

// Custom CSS Injection for sleek scrollbars, dynamic App Bar, and page layout offset
const customStyles = `
  :root {
    --cr-bg: #141519;
    --cr-bg-alt: #23252b;
    --cr-text: #ffffff;
    --cr-text-dim: #a0a0a0;
    --cr-border: rgba(255, 255, 255, 0.18);
    --cr-accent: #ff6400;
    --cr-accent-hover: #ff7e29;
  }

  [data-theme="light"] {
    --cr-bg: #f5f6f8;
    --cr-bg-alt: #ffffff;
    --cr-text: #141519;
    --cr-text-dim: #5a5d66;
    --cr-border: rgba(0, 0, 0, 0.18);
    --cr-accent: #ff6400;
    --cr-accent-hover: #e55a00;
  }

  /* Body & Header Offset to accommodate top App Bar */
  body {
    padding-top: 42px !important;
  }

  /* Adjust Crunchyroll sticky/fixed headers */
  header, [class*="header_wrapper"], [class*="erc-header"], [data-t="header-wrapper"], nav[class*="header"] {
    top: 42px !important;
  }

  /* Custom Scrollbar */
  ::-webkit-scrollbar {
    width: 8px !important;
    height: 8px !important;
    background: transparent !important;
  }
  ::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.25) !important;
    border-radius: 4px !important;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.45) !important;
  }

  /* Top App Bar Container */
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
    padding: 0 14px !important;
    box-sizing: border-box !important;
    z-index: 2147483647 !important;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
    font-size: 13px !important;
    user-select: none !important;
    transition: transform 0.25s ease, background 0.3s ease !important;
    backdrop-filter: blur(16px) !important;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5) !important;
    opacity: 1 !important;
    visibility: visible !important;
    pointer-events: auto !important;
  }

  #cr-app-bar.collapsed {
    transform: translateY(-36px) !important;
  }

  /* When fullscreen video, hide App Bar completely and reset body padding */
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

  /* App Bar Sections */
  .cr-bar-section {
    display: flex !important;
    align-items: center !important;
    gap: 6px !important;
  }

  /* Buttons */
  .cr-btn {
    background: var(--cr-bg-alt) !important;
    color: var(--cr-text) !important;
    border: 1px solid var(--cr-border) !important;
    border-radius: 6px !important;
    padding: 5px 10px !important;
    font-size: 12px !important;
    font-weight: 600 !important;
    cursor: pointer !important;
    display: inline-flex !important;
    align-items: center !important;
    gap: 5px !important;
    transition: all 0.15s ease !important;
    line-height: 1.2 !important;
  }

  .cr-btn:hover {
    border-color: var(--cr-accent) !important;
    color: var(--cr-accent) !important;
    transform: translateY(-1px) !important;
  }

  .cr-btn:active {
    transform: translateY(0) !important;
  }

  .cr-btn.active {
    background: rgba(255, 100, 0, 0.2) !important;
    border-color: var(--cr-accent) !important;
    color: var(--cr-accent) !important;
  }

  .cr-btn.disabled,
  .cr-btn:disabled {
    opacity: 0.35 !important;
    cursor: not-allowed !important;
    border-color: var(--cr-border) !important;
    color: var(--cr-text-dim) !important;
    pointer-events: none !important;
    transform: none !important;
  }

  /* Navigation Action Buttons (Back & Forward) */
  .cr-nav-btn {
    font-weight: 700 !important;
    padding: 5px 12px !important;
    background: var(--cr-bg-alt) !important;
    border: 1px solid var(--cr-border) !important;
  }
  .cr-nav-btn:hover:not(:disabled) {
    background: rgba(255, 100, 0, 0.15) !important;
    border-color: var(--cr-accent) !important;
    color: var(--cr-accent) !important;
  }
  .cr-nav-arrow {
    font-size: 13px !important;
    font-weight: bold !important;
  }

  .cr-toggle-handle {
    position: absolute !important;
    bottom: -18px !important;
    right: 24px !important;
    background: var(--cr-bg-alt) !important;
    border: 1px solid var(--cr-border) !important;
    border-top: none !important;
    border-radius: 0 0 6px 6px !important;
    padding: 0 10px !important;
    font-size: 10px !important;
    cursor: pointer !important;
    color: var(--cr-text-dim) !important;
    line-height: 18px !important;
    z-index: 2147483647 !important;
  }
  .cr-toggle-handle:hover {
    color: var(--cr-accent) !important;
  }

  /* Modal & Setup Wizard */
  #cr-setup-modal-overlay {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    background: rgba(0, 0, 0, 0.8) !important;
    backdrop-filter: blur(8px) !important;
    z-index: 2147483647 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
    animation: crFadeIn 0.2s ease !important;
  }

  @keyframes crFadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .cr-modal-card {
    background: var(--cr-bg) !important;
    color: var(--cr-text) !important;
    border: 1px solid var(--cr-border) !important;
    border-radius: 16px !important;
    width: 90% !important;
    max-width: 520px !important;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.9), 0 0 0 1px var(--cr-border) !important;
    overflow: hidden !important;
  }

  .cr-modal-header {
    padding: 24px 24px 16px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    border-bottom: 1px solid var(--cr-border) !important;
  }

  .cr-modal-title {
    display: flex !important;
    align-items: center !important;
    gap: 12px !important;
    font-size: 20px !important;
    font-weight: 700 !important;
    color: var(--cr-text) !important;
  }

  .cr-modal-close {
    background: transparent !important;
    border: none !important;
    color: var(--cr-text-dim) !important;
    font-size: 20px !important;
    cursor: pointer !important;
    line-height: 1 !important;
    padding: 4px !important;
    border-radius: 6px !important;
  }
  .cr-modal-close:hover {
    color: var(--cr-text) !important;
    background: var(--cr-bg-alt) !important;
  }

  .cr-modal-body {
    padding: 20px 24px !important;
    max-height: 70vh !important;
    overflow-y: auto !important;
  }

  .cr-setup-row {
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    padding: 12px 0 !important;
    border-bottom: 1px solid var(--cr-border) !important;
  }

  .cr-setup-info h4 {
    margin: 0 0 4px 0 !important;
    font-size: 14px !important;
    font-weight: 600 !important;
  }
  .cr-setup-info p {
    margin: 0 !important;
    font-size: 12px !important;
    color: var(--cr-text-dim) !important;
  }

  .cr-shortcut-pill {
    background: var(--cr-bg-alt) !important;
    padding: 2px 6px !important;
    border-radius: 4px !important;
    border: 1px solid var(--cr-border) !important;
    font-family: monospace !important;
    font-size: 11px !important;
    color: var(--cr-accent) !important;
  }

  .cr-modal-footer {
    padding: 16px 24px !important;
    background: var(--cr-bg-alt) !important;
    display: flex !important;
    justify-content: flex-end !important;
    border-top: 1px solid var(--cr-border) !important;
  }

  .cr-primary-btn {
    background: var(--cr-accent) !important;
    color: #ffffff !important;
    border: none !important;
    border-radius: 8px !important;
    padding: 10px 20px !important;
    font-weight: 600 !important;
    font-size: 14px !important;
    cursor: pointer !important;
    transition: background 0.15s ease !important;
  }
  .cr-primary-btn:hover {
    background: var(--cr-accent-hover) !important;
  }
`;

// Initialize Theme
function applyTheme(isDark) {
  currentTheme = isDark ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', currentTheme);
  const themeBtn = document.getElementById('cr-theme-btn');
  if (themeBtn) {
    themeBtn.innerHTML = isDark ? '🌙 Dark' : '☀️ Light';
  }
}

// Request initial theme from main process
ipcRenderer.invoke('get-theme-info').then(info => {
  if (info) applyTheme(info.shouldUseDarkColors);
}).catch(() => {});

// Listen for device/system theme changes live
ipcRenderer.on('theme-changed', (event, info) => {
  if (info) applyTheme(info.shouldUseDarkColors);
});

// Update navigation buttons status (Back/Forward enabled/disabled)
function updateNavButtons(state) {
  if (!state) return;
  navState = state;
  const backBtn = document.getElementById('cr-nav-back');
  const forwardBtn = document.getElementById('cr-nav-forward');
  if (backBtn) {
    backBtn.disabled = !state.canGoBack;
    backBtn.classList.toggle('disabled', !state.canGoBack);
  }
  if (forwardBtn) {
    forwardBtn.disabled = !state.canGoForward;
    forwardBtn.classList.toggle('disabled', !state.canGoForward);
  }
}

// Listen for navigation state from main process
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

// Open Setup / Welcome Wizard Modal
function openSetupModal() {
  if (document.getElementById('cr-setup-modal-overlay')) return;

  const modal = document.createElement('div');
  modal.id = 'cr-setup-modal-overlay';
  modal.innerHTML = `
    <div class="cr-modal-card">
      <div class="cr-modal-header">
        <div class="cr-modal-title">
          <span>🎬</span>
          <span>Crunchyroll Desktop Setup</span>
        </div>
        <button class="cr-modal-close" id="cr-modal-close-btn">✕</button>
      </div>

      <div class="cr-modal-body">
        <div class="cr-setup-row">
          <div class="cr-setup-info">
            <h4>Widevine DRM Engine</h4>
            <p>Hardware-accelerated media decryption</p>
          </div>
          <span style="color: #28a745; font-weight: 600; font-size: 13px;">● Active & Ready</span>
        </div>

        <div class="cr-setup-row">
          <div class="cr-setup-info">
            <h4>Auto-Skip Intros & Recaps</h4>
            <p>Automatically click skip prompts during playback</p>
          </div>
          <button class="cr-btn ${autoSkipEnabled ? 'active' : ''}" id="cr-modal-skip-toggle">
            ${autoSkipEnabled ? 'Enabled' : 'Disabled'}
          </button>
        </div>

        <div class="cr-setup-row">
          <div class="cr-setup-info">
            <h4>Device Theme Sync</h4>
            <p>Match OS Dark and Light mode automatically</p>
          </div>
          <button class="cr-btn" id="cr-modal-theme-toggle">
            ${currentTheme === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode'}
          </button>
        </div>

        <div style="margin-top: 16px;">
          <h4 style="margin: 0 0 10px 0; font-size: 13px; color: var(--cr-text-dim);">NAVIGATION & SHORTCUTS</h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px;">
            <div><span class="cr-shortcut-pill">Alt+←</span> / <span class="cr-shortcut-pill">Alt+→</span> Back / Forward</div>
            <div><span class="cr-shortcut-pill">[</span> / <span class="cr-shortcut-pill">]</span> Adjust Speed</div>
            <div><span class="cr-shortcut-pill">P</span> Picture-in-Picture</div>
            <div><span class="cr-shortcut-pill">Space</span> Play / Pause</div>
            <div><span class="cr-shortcut-pill">F</span> Fullscreen</div>
          </div>
        </div>
      </div>

      <div class="cr-modal-footer">
        <button class="cr-primary-btn" id="cr-modal-done-btn">Save & Start Watching</button>
      </div>
    </div>
  `;

  const target = document.body || document.documentElement;
  if (target) target.appendChild(modal);

  // Close logic
  const closeModal = () => {
    localStorage.setItem('cr_setup_completed_v1', 'true');
    modal.remove();
  };

  document.getElementById('cr-modal-close-btn').addEventListener('click', closeModal);
  document.getElementById('cr-modal-done-btn').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Modal Toggles
  const modalSkipBtn = document.getElementById('cr-modal-skip-toggle');
  modalSkipBtn.addEventListener('click', () => {
    autoSkipEnabled = !autoSkipEnabled;
    modalSkipBtn.innerHTML = autoSkipEnabled ? 'Enabled' : 'Disabled';
    modalSkipBtn.classList.toggle('active', autoSkipEnabled);
    const barSkipBtn = document.getElementById('cr-auto-skip-btn');
    if (barSkipBtn) {
      barSkipBtn.innerHTML = autoSkipEnabled ? '⚡ Skip: ON' : '⚡ Skip: OFF';
      barSkipBtn.classList.toggle('active', autoSkipEnabled);
    }
  });

  const modalThemeBtn = document.getElementById('cr-modal-theme-toggle');
  modalThemeBtn.addEventListener('click', () => {
    applyTheme(currentTheme !== 'dark');
    modalThemeBtn.innerHTML = currentTheme === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode';
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
    <!-- Left Navigation: Back, Forward, Reload, Home -->
    <div class="cr-bar-section">
      <button class="cr-btn cr-nav-btn" id="cr-nav-back" title="Go Back (Alt+Left)">
        <span class="cr-nav-arrow">◀</span> <span>Back</span>
      </button>
      <button class="cr-btn cr-nav-btn" id="cr-nav-forward" title="Go Forward (Alt+Right)">
        <span>Forward</span> <span class="cr-nav-arrow">▶</span>
      </button>
      <button class="cr-btn" id="cr-nav-reload" title="Refresh Page (Ctrl+R)">🔄 Refresh</button>
      <button class="cr-btn" id="cr-nav-home" title="Crunchyroll Home">🏠 Home</button>
    </div>

    <!-- Center Quick Navigation -->
    <div class="cr-bar-section">
      <button class="cr-btn" id="cr-quick-browse">🍿 Explore</button>
      <button class="cr-btn" id="cr-quick-simulcasts">📅 Simulcasts</button>
      <button class="cr-btn" id="cr-quick-watchlist">🔖 Watchlist</button>
    </div>

    <!-- Right Player & Theme Tools -->
    <div class="cr-bar-section">
      <button class="cr-btn active" id="cr-auto-skip-btn" title="Toggle Auto-Skip Intro/Recap">⚡ Skip: ON</button>
      <button class="cr-btn" id="cr-speed-btn" title="Cycle Playback Speed">⏩ 1.0x</button>
      <button class="cr-btn" id="cr-pip-btn" title="Toggle Picture-in-Picture">📺 PiP</button>
      <button class="cr-btn" id="cr-theme-btn" title="Device Theme">${currentTheme === 'dark' ? '🌙 Dark' : '☀️ Light'}</button>
      <button class="cr-btn" id="cr-settings-btn" title="Quick Setup & Preferences">⚙️</button>
    </div>

    <!-- Collapse / Expand Handle -->
    <div class="cr-toggle-handle" id="cr-collapse-btn" title="Toggle Toolbar">▲</div>
  `;

  target.appendChild(bar);

  // Initial navigation state check
  ipcRenderer.invoke('get-nav-state').then(state => {
    if (state) updateNavButtons(state);
  }).catch(() => {});

  // Hook Settings Button
  document.getElementById('cr-settings-btn').addEventListener('click', openSetupModal);

  // Check First Run Setup
  if (localStorage.getItem('cr_setup_completed_v1') !== 'true') {
    setTimeout(openSetupModal, 800);
  }

  // Hook Navigation buttons
  document.getElementById('cr-nav-back').addEventListener('click', () => {
    ipcRenderer.send('nav-back');
  });
  document.getElementById('cr-nav-forward').addEventListener('click', () => {
    ipcRenderer.send('nav-forward');
  });
  document.getElementById('cr-nav-reload').addEventListener('click', () => {
    ipcRenderer.send('nav-reload');
  });
  document.getElementById('cr-nav-home').addEventListener('click', () => {
    ipcRenderer.send('nav-home');
  });

  // Hook Quick Links
  document.getElementById('cr-quick-browse').addEventListener('click', () => {
    ipcRenderer.send('nav-url', 'https://www.crunchyroll.com/videos/popular');
  });
  document.getElementById('cr-quick-simulcasts').addEventListener('click', () => {
    ipcRenderer.send('nav-url', 'https://www.crunchyroll.com/simulcasts');
  });
  document.getElementById('cr-quick-watchlist').addEventListener('click', () => {
    ipcRenderer.send('nav-url', 'https://www.crunchyroll.com/watchlist');
  });

  // Hook Player Controls
  const autoSkipBtn = document.getElementById('cr-auto-skip-btn');
  autoSkipBtn.addEventListener('click', () => {
    autoSkipEnabled = !autoSkipEnabled;
    autoSkipBtn.innerHTML = autoSkipEnabled ? '⚡ Skip: ON' : '⚡ Skip: OFF';
    autoSkipBtn.classList.toggle('active', autoSkipEnabled);
    showToast(`Auto-Skip: ${autoSkipEnabled ? 'ON' : 'OFF'}`);
  });

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
    speedBtn.innerHTML = `⏩ ${nextRate}x`;
    showToast(`Speed: ${nextRate}x`);
  });

  document.getElementById('cr-pip-btn').addEventListener('click', () => {
    const video = getActiveVideos()[0];
    if (video) {
      if (document.pictureInPictureElement) {
        document.exitPictureInPicture().catch(() => {});
        showToast('PiP: Off');
      } else if (document.pictureInPictureEnabled && video.readyState >= 1) {
        video.requestPictureInPicture().then(() => showToast('PiP: On')).catch(() => {});
      }
    } else {
      showToast('No active video found');
    }
  });

  // Toggle Collapse
  const collapseBtn = document.getElementById('cr-collapse-btn');
  collapseBtn.addEventListener('click', () => {
    isAppBarCollapsed = !isAppBarCollapsed;
    bar.classList.toggle('collapsed', isAppBarCollapsed);
    collapseBtn.innerHTML = isAppBarCollapsed ? '▼' : '▲';
  });

  // Apply last known navState
  updateNavButtons(navState);
}

// Permanent Guardian to ensure App Bar and styles are never removed by React SPA re-renders
function ensureAppBar() {
  injectStyles();
  if (!document.getElementById('cr-app-bar') || !document.getElementById('cr-custom-styles')) {
    createAppBar();
  }
}

// Show on-screen toast indicator
function showToast(text) {
  let toast = document.getElementById('cr-toast-indicator');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'cr-toast-indicator';
    toast.style.cssText = `
      position: fixed !important;
      top: 50px !important;
      right: 30px !important;
      background: rgba(15, 15, 15, 0.92) !important;
      color: #ffffff !important;
      padding: 10px 18px !important;
      border-radius: 8px !important;
      font-size: 14px !important;
      font-weight: bold !important;
      border: 1px solid #ff6400 !important;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5) !important;
      z-index: 2147483647 !important;
      pointer-events: none !important;
      transition: opacity 0.3s ease !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
    `;
    const target = document.body || document.documentElement;
    if (target) target.appendChild(toast);
  }
  toast.innerText = text;
  toast.style.opacity = '1';

  clearTimeout(window.__crToastTimeout);
  window.__crToastTimeout = setTimeout(() => {
    if (toast) toast.style.opacity = '0';
  }, 1200);
}

// Find all video elements, including those inside Shadow DOM
function getActiveVideos() {
  const videos = [];
  function searchRoot(root) {
    if (!root) return;
    try {
      const found = root.querySelectorAll ? root.querySelectorAll('video') : [];
      found.forEach(v => videos.push(v));
      const elements = root.querySelectorAll ? root.querySelectorAll('*') : [];
      for (let i = 0; i < elements.length; i++) {
        if (elements[i].shadowRoot) {
          searchRoot(elements[i].shadowRoot);
        }
      }
    } catch (e) {}
  }
  searchRoot(document);
  return videos;
}

// Attach playback rate and state listeners to video
function attachVideoListeners(video) {
  if (video.__crAttached) return;
  video.__crAttached = true;

  if (window.__crPlaybackRate) {
    video.playbackRate = window.__crPlaybackRate;
    video.defaultPlaybackRate = window.__crPlaybackRate;
  }

  const notifyState = () => {
    try {
      ipcRenderer.send('playback-state-change', !video.paused && !video.ended);
    } catch (e) {}
  };

  video.addEventListener('play', notifyState);
  video.addEventListener('playing', notifyState);
  video.addEventListener('pause', notifyState);
  video.addEventListener('ended', notifyState);

  video.addEventListener('ratechange', () => {
    if (window.__crPlaybackRate && Math.abs(video.playbackRate - window.__crPlaybackRate) > 0.05) {
      video.playbackRate = window.__crPlaybackRate;
    }
  });

  notifyState();
}

// Auto-Skip Intro & Recap observer
function checkAndAutoSkip() {
  if (!autoSkipEnabled) return;
  function scanRoot(root) {
    if (!root) return;
    try {
      const candidates = root.querySelectorAll ? root.querySelectorAll(
        '[data-t="skip-intro-btn"], [data-t="skip-recap-btn"], [data-t="skip-button"], ' +
        '[data-testid*="skip"], button[class*="skip"], div[class*="skip"][role="button"], ' +
        '.vjs-skip-intro, .vjs-skip-recap, .skip-button'
      ) : [];

      for (let i = 0; i < candidates.length; i++) {
        const btn = candidates[i];
        if (btn && btn.offsetParent !== null && !btn.disabled) {
          btn.click();
          return;
        }
      }

      const buttons = root.querySelectorAll ? root.querySelectorAll('button, div[role="button"]') : [];
      for (let i = 0; i < buttons.length; i++) {
        const btn = buttons[i];
        if (btn && btn.offsetParent !== null && !btn.disabled) {
          const txt = (btn.innerText || btn.textContent || '').trim().toLowerCase();
          if (txt === 'skip intro' || txt === 'skip recap' || txt === 'skip' || txt === 'skip credits') {
            btn.click();
            return;
          }
        }
      }

      const elements = root.querySelectorAll ? root.querySelectorAll('*') : [];
      for (let i = 0; i < elements.length; i++) {
        if (elements[i].shadowRoot) {
          scanRoot(elements[i].shadowRoot);
        }
      }
    } catch (e) {}
  }

  scanRoot(document);
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
    const speedBtn = document.getElementById('cr-speed-btn');
    if (speedBtn) speedBtn.innerHTML = `⏩ ${newRate}x`;
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
    const speedBtn = document.getElementById('cr-speed-btn');
    if (speedBtn) speedBtn.innerHTML = `⏩ ${newRate}x`;
    showToast(`Speed: ${newRate}x`);
    return;
  }

  // Picture-in-Picture: 'P' or 'p'
  if ((e.key === 'p' || e.key === 'P' || e.code === 'KeyP') && !e.ctrlKey && !e.metaKey && !e.altKey) {
    if (!video) return;
    e.stopImmediatePropagation();
    e.preventDefault();
    if (document.pictureInPictureElement) {
      document.exitPictureInPicture().catch(() => {});
      showToast('PiP: Off');
    } else if (document.pictureInPictureEnabled && video.readyState >= 1) {
      video.requestPictureInPicture().then(() => {
        showToast('PiP: On');
      }).catch(() => {});
    }
    return;
  }
}

// Setup immediate listeners
window.addEventListener('keydown', handleGlobalKeyDown, true);
document.addEventListener('keydown', handleGlobalKeyDown, true);

// Initial setup attempt
ensureAppBar();

// Setup on DOM events
window.addEventListener('DOMContentLoaded', () => {
  ensureAppBar();
  const videos = getActiveVideos();
  videos.forEach(attachVideoListeners);
});

window.addEventListener('load', () => {
  ensureAppBar();
});

// Continuous loop for SPA navigation, video tracking, and auto-skip
setInterval(() => {
  ensureAppBar();
  const videos = getActiveVideos();
  videos.forEach(attachVideoListeners);
  checkAndAutoSkip();
}, 400);
