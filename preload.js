const { contextBridge, ipcRenderer } = require('electron');

// Custom CSS Injection for sleek dark scrollbars
const customStyles = `
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
    background: transparent;
  }
  ::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.25);
    border-radius: 4px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.45);
  }
  #cr-toast-indicator {
    position: fixed;
    top: 24px;
    right: 24px;
    background: rgba(0, 0, 0, 0.85);
    color: #ff6400;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 15px;
    font-weight: bold;
    padding: 8px 16px;
    border-radius: 8px;
    border: 1px solid rgba(255, 100, 0, 0.4);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
    z-index: 999999;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.2s ease-in-out;
  }
`;

// Helper: Show brief on-screen indicator
function showToast(text) {
  let toast = document.getElementById('cr-toast-indicator');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'cr-toast-indicator';
    document.body.appendChild(toast);
  }
  toast.innerText = text;
  toast.style.opacity = '1';
  clearTimeout(toast._hideTimeout);
  toast._hideTimeout = setTimeout(() => {
    toast.style.opacity = '0';
  }, 1500);
}

// Attach video listeners for power-saving & state tracking
function attachVideoListeners(video) {
  if (video._crListenersAttached) return;
  video._crListenersAttached = true;

  const notifyState = () => {
    ipcRenderer.send('playback-state-change', !video.paused && !video.ended);
  };

  video.addEventListener('play', notifyState);
  video.addEventListener('playing', notifyState);
  video.addEventListener('pause', notifyState);
  video.addEventListener('ended', notifyState);

  notifyState();
}

window.addEventListener('DOMContentLoaded', () => {
  // Inject custom CSS
  const styleEl = document.createElement('style');
  styleEl.innerText = customStyles;
  document.head.appendChild(styleEl);

  // Observe DOM for video element insertions
  const observer = new MutationObserver(() => {
    const videos = document.querySelectorAll('video');
    videos.forEach(attachVideoListeners);

    // Auto-detect and click "Skip Intro" / "Skip Recap" buttons if visible
    const skipButtons = document.querySelectorAll('[data-t="skip-intro-btn"], [data-t="skip-recap-btn"], button[class*="skip-intro"], button[class*="skip-button"]');
    skipButtons.forEach(btn => {
      if (btn && btn.offsetParent !== null && !btn.disabled) {
        btn.click();
      }
    });
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  // Global player keyboard shortcuts
  window.addEventListener('keydown', (e) => {
    // Ignore keystrokes in form inputs
    const targetTag = e.target && e.target.tagName ? e.target.tagName.toLowerCase() : '';
    if (targetTag === 'input' || targetTag === 'textarea' || e.target.isContentEditable) {
      return;
    }

    const video = document.querySelector('video');
    if (!video) return;

    // '[': Decrease playback speed
    if (e.key === '[') {
      e.preventDefault();
      video.playbackRate = Math.max(0.25, parseFloat((video.playbackRate - 0.25).toFixed(2)));
      showToast(`Speed: ${video.playbackRate}x`);
    }

    // ']': Increase playback speed
    if (e.key === ']') {
      e.preventDefault();
      video.playbackRate = Math.min(3.0, parseFloat((video.playbackRate + 0.25).toFixed(2)));
      showToast(`Speed: ${video.playbackRate}x`);
    }

    // 'p' or 'P': Picture-in-Picture toggle
    if ((e.key === 'p' || e.key === 'P') && !e.ctrlKey && !e.metaKey) {
      if (document.pictureInPictureElement) {
        document.exitPictureInPicture().catch(() => {});
        showToast('PiP: Off');
      } else if (document.pictureInPictureEnabled && video.readyState >= 2) {
        video.requestPictureInPicture().then(() => {
          showToast('PiP: On');
        }).catch(() => {});
      }
    }
  });
});

