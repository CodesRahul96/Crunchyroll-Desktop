const { ipcRenderer } = require('electron');

let currentTheme = 'dark';
let autoSkipEnabled = true;
let isAppBarCollapsed = false;

// Custom CSS Injection for sleek dark scrollbars & dynamic App Bar
const customStyles = `
  :root {
    --cr-bg: #141519;
    --cr-bg-alt: #23252b;
    --cr-text: #ffffff;
    --cr-text-dim: #a0a0a0;
    --cr-border: rgba(255, 255, 255, 0.12);
    --cr-accent: #ff6400;
    --cr-accent-hover: #ff7e29;
  }

  [data-theme="light"] {
    --cr-bg: #f5f6f8;
    --cr-bg-alt: #ffffff;
    --cr-text: #141519;
    --cr-text-dim: #5a5d66;
    --cr-border: rgba(0, 0, 0, 0.12);
    --cr-accent: #ff6400;
    --cr-accent-hover: #e55a00;
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

  /* App Bar Container */
  #cr-app-bar {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 40px;
    background: var(--cr-bg);
    color: var(--cr-text);
    border-bottom: 1px solid var(--cr-border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 12px;
    box-sizing: border-box;
    z-index: 2147483646;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 13px;
    user-select: none;
    transition: transform 0.25s ease, background 0.3s ease;
    backdrop-filter: blur(12px);
  }

  #cr-app-bar.collapsed {
    transform: translateY(-34px);
  }

  /* When fullscreen, hide App Bar completely */
  :fullscreen #cr-app-bar,
  :-webkit-full-screen #cr-app-bar {
    display: none !important;
  }

  /* App Bar Sections */
  .cr-bar-section {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .cr-btn {
    background: var(--cr-bg-alt);
    color: var(--cr-text);
    border: 1px solid var(--cr-border);
    border-radius: 6px;
    padding: 4px 8px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    transition: all 0.15s ease;
  }

  .cr-btn:hover {
    border-color: var(--cr-accent);
    color: var(--cr-accent);
  }

  .cr-btn.active {
    background: rgba(255, 100, 0, 0.15);
    border-color: var(--cr-accent);
    color: var(--cr-accent);
  }

  .cr-toggle-handle {
    position: absolute;
    bottom: -16px;
    right: 24px;
    background: var(--cr-bg-alt);
    border: 1px solid var(--cr-border);
    border-top: none;
    border-radius: 0 0 6px 6px;
    padding: 0 8px;
    font-size: 10px;
    cursor: pointer;
    color: var(--cr-text-dim);
    line-height: 16px;
  }
  .cr-toggle-handle:hover {
    color: var(--cr-accent);
  }
  /* Modal & Setup Wizard */
  #cr-setup-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.75);
    backdrop-filter: blur(8px);
    z-index: 2147483647;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    animation: crFadeIn 0.2s ease;
  }

  @keyframes crFadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .cr-modal-card {
    background: var(--cr-bg);
    color: var(--cr-text);
    border: 1px solid var(--cr-border);
    border-radius: 16px;
    width: 90%;
    max-width: 520px;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8), 0 0 0 1px var(--cr-border);
    overflow: hidden;
  }

  .cr-modal-header {
    padding: 24px 24px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid var(--cr-border);
  }

  .cr-modal-title {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 20px;
    font-weight: 700;
    color: var(--cr-text);
  }

  .cr-modal-title img {
    width: 32px;
    height: 32px;
  }

  .cr-modal-close {
    background: transparent;
    border: none;
    color: var(--cr-text-dim);
    font-size: 20px;
    cursor: pointer;
    line-height: 1;
    padding: 4px;
    border-radius: 6px;
  }
  .cr-modal-close:hover {
    color: var(--cr-text);
    background: var(--cr-bg-alt);
  }

  .cr-modal-body {
    padding: 20px 24px;
    max-height: 70vh;
    overflow-y: auto;
  }

  .cr-setup-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 0;
    border-bottom: 1px solid var(--cr-border);
  }

  .cr-setup-info h4 {
    margin: 0 0 4px 0;
    font-size: 14px;
    font-weight: 600;
  }
  .cr-setup-info p {
    margin: 0;
    font-size: 12px;
    color: var(--cr-text-dim);
  }

  .cr-shortcut-pill {
    background: var(--cr-bg-alt);
    padding: 2px 6px;
    border-radius: 4px;
    border: 1px solid var(--cr-border);
    font-family: monospace;
    font-size: 11px;
    color: var(--cr-accent);
  }

  .cr-modal-footer {
    padding: 16px 24px;
    background: var(--cr-bg-alt);
    display: flex;
    justify-content: flex-end;
    border-top: 1px solid var(--cr-border);
  }

  .cr-primary-btn {
    background: var(--cr-accent);
    color: #ffffff;
    border: none;
    border-radius: 8px;
    padding: 10px 20px;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: background 0.15s ease;
  }
  .cr-primary-btn:hover {
    background: var(--cr-accent-hover);
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

// Inject styles
function injectStyles() {
  if (document.getElementById('cr-custom-styles')) return;
  const styleEl = document.createElement('style');
  styleEl.id = 'cr-custom-styles';
  styleEl.innerText = customStyles;
  (document.head || document.documentElement).appendChild(styleEl);
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
          <h4 style="margin: 0 0 10px 0; font-size: 13px; color: var(--cr-text-dim);">KEYBOARD SHORTCUTS</h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px;">
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

  (document.body || document.documentElement).appendChild(modal);

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
  if (document.getElementById('cr-app-bar')) return;

  const bar = document.createElement('div');
  bar.id = 'cr-app-bar';
  bar.innerHTML = `
    <!-- Left Navigation -->
    <div class="cr-bar-section">
      <button class="cr-btn" id="cr-nav-back" title="Back">◀</button>
      <button class="cr-btn" id="cr-nav-forward" title="Forward">▶</button>
      <button class="cr-btn" id="cr-nav-reload" title="Refresh">🔄</button>
      <button class="cr-btn" id="cr-nav-home" title="Home">🏠 Home</button>
    </div>

    <!-- Center Quick Navigation -->
    <div class="cr-bar-section">
      <button class="cr-btn" id="cr-quick-browse">Explore</button>
      <button class="cr-btn" id="cr-quick-simulcasts">Simulcasts</button>
      <button class="cr-btn" id="cr-quick-watchlist">Watchlist</button>
    </div>

    <!-- Right Player & Theme Tools -->
    <div class="cr-bar-section">
      <button class="cr-btn active" id="cr-auto-skip-btn" title="Toggle Auto-Skip Intro/Recap">⚡ Skip: ON</button>
      <button class="cr-btn" id="cr-speed-btn" title="Cycle Playback Speed">⏩ 1.0x</button>
      <button class="cr-btn" id="cr-pip-btn" title="Toggle Picture-in-Picture">📺 PiP</button>
      <button class="cr-btn" id="cr-theme-btn" title="System Theme">${currentTheme === 'dark' ? '🌙 Dark' : '☀️ Light'}</button>
      <button class="cr-btn" id="cr-settings-btn" title="Quick Setup & Preferences">⚙️</button>
    </div>

    <!-- Collapse / Expand Handle -->
    <div class="cr-toggle-handle" id="cr-collapse-btn" title="Toggle Toolbar">▲</div>
  `;

  (document.body || document.documentElement).appendChild(bar);

  // Hook Settings Button
  document.getElementById('cr-settings-btn').addEventListener('click', openSetupModal);

  // Check First Run Setup
  if (localStorage.getItem('cr_setup_completed_v1') !== 'true') {
    setTimeout(openSetupModal, 800);
  }

  // Hook Navigation buttons
  document.getElementById('cr-nav-back').addEventListener('click', () => ipcRenderer.send('nav-back'));
  document.getElementById('cr-nav-forward').addEventListener('click', () => ipcRenderer.send('nav-forward'));
  document.getElementById('cr-nav-reload').addEventListener('click', () => ipcRenderer.send('nav-reload'));
  document.getElementById('cr-nav-home').addEventListener('click', () => ipcRenderer.send('nav-home'));

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
      color: #ff6400 !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
      font-size: 16px !important;
      font-weight: 700 !important;
      padding: 10px 20px !important;
      border-radius: 8px !important;
      border: 1px solid rgba(255, 100, 0, 0.6) !important;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.7) !important;
      z-index: 2147483647 !important;
      pointer-events: none !important;
      opacity: 0 !important;
      transition: opacity 0.2s ease-in-out !important;
    `;
    (document.body || document.documentElement).appendChild(toast);
  }
  toast.innerText = text;
  toast.style.opacity = '1';
  clearTimeout(toast._hideTimeout);
  toast._hideTimeout = setTimeout(() => {
    if (toast) toast.style.opacity = '0';
  }, 1400);
}

// Recursive helper to find all <video> elements across DOM & Shadow DOM
function getActiveVideos() {
  const videos = [];
  function scan(root) {
    if (!root) return;
    try {
      const vids = root.querySelectorAll ? root.querySelectorAll('video') : [];
      for (let i = 0; i < vids.length; i++) {
        videos.push(vids[i]);
      }
      const allEls = root.querySelectorAll ? root.querySelectorAll('*') : [];
      for (let i = 0; i < allEls.length; i++) {
        if (allEls[i].shadowRoot) {
          scan(allEls[i].shadowRoot);
        }
      }
    } catch (e) {}
  }
  scan(document);
  return videos;
}

// Attach listeners to videos for power management & rate preservation
function attachVideoListeners(video) {
  if (!video || video._crAttached) return;
  video._crAttached = true;

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
    if (speedBtn) speedBtn.innerHTML = `⏩ ${nextRate}x`;
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

// Setup immediately
injectStyles();
window.addEventListener('keydown', handleGlobalKeyDown, true);
document.addEventListener('keydown', handleGlobalKeyDown, true);

// Loop for video tracking and auto-skip
setInterval(() => {
  const videos = getActiveVideos();
  videos.forEach(attachVideoListeners);
  checkAndAutoSkip();
}, 500);

window.addEventListener('DOMContentLoaded', () => {
  injectStyles();
  createAppBar();
  const videos = getActiveVideos();
  videos.forEach(attachVideoListeners);
});



