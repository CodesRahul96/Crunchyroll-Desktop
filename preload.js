const { ipcRenderer } = require('electron');

// Custom CSS Injection for sleek dark scrollbars
const customStyles = `
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
`;

// Inject scrollbar styles immediately and on load
function injectStyles() {
  if (document.getElementById('cr-custom-styles')) return;
  const styleEl = document.createElement('style');
  styleEl.id = 'cr-custom-styles';
  styleEl.innerText = customStyles;
  (document.head || document.documentElement).appendChild(styleEl);
}

// Show on-screen toast indicator
function showToast(text) {
  let toast = document.getElementById('cr-toast-indicator');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'cr-toast-indicator';
    toast.style.cssText = `
      position: fixed !important;
      top: 30px !important;
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

  // Re-apply speed if player resets it on buffer
  video.addEventListener('ratechange', () => {
    if (window.__crPlaybackRate && Math.abs(video.playbackRate - window.__crPlaybackRate) > 0.05) {
      video.playbackRate = window.__crPlaybackRate;
    }
  });

  notifyState();
}

// Auto-Skip Intro & Recap observer
function checkAndAutoSkip() {
  function scanRoot(root) {
    if (!root) return;
    try {
      // 1. Selector-based match
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

      // 2. Text-based match on visible buttons
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

      // 3. Scan shadow roots
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

// Keydown handler registered in CAPTURE phase so player cannot suppress it
function handleGlobalKeyDown(e) {
  // Ignore keystrokes in inputs, textareas, contentEditable
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

// Setup listeners immediately
injectStyles();
window.addEventListener('keydown', handleGlobalKeyDown, true);
document.addEventListener('keydown', handleGlobalKeyDown, true);

// Interval loop to monitor videos and auto-skip
setInterval(() => {
  const videos = getActiveVideos();
  videos.forEach(attachVideoListeners);
  checkAndAutoSkip();
}, 500);

window.addEventListener('DOMContentLoaded', () => {
  injectStyles();
  const videos = getActiveVideos();
  videos.forEach(attachVideoListeners);
});


