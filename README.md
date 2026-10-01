<div align="center">
  <img src="resources/app/icon.png" width="100" height="100" alt="Crunchyroll Logo" />
  <h1>Crunchyroll</h1>
  <p><strong>A modern, high-performance, cross-platform desktop client for Linux, Windows, and macOS with Widevine DRM support.</strong></p>

  <p>
    <a href="https://github.com/CodesRahul96/Crunchyroll-Desktop/releases"><img src="https://img.shields.io/github/v/release/CodesRahul96/Crunchyroll-Desktop?style=for-the-badge&color=ff6400&label=Release" alt="Release" /></a>
    <img src="https://img.shields.io/badge/Platform-Linux%20%7C%20Windows%20%7C%20macOS-blue?style=for-the-badge" alt="Platforms" />
    <img src="https://img.shields.io/badge/DRM-Widevine%20Ready-green?style=for-the-badge" alt="DRM" />
    <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" alt="License" /></a>
  </p>
</div>

---

## ✨ Features

- 🌐 **True Cross-Platform**: Optimized packages for **Linux** (AppImage, Deb), **Windows** (Installer & Portable .exe), and **macOS** (DMG & Zip).
- 🔓 **Widevine DRM Out-of-the-Box**: Bundled DRM support for smooth playback of protected anime streams without browser restrictions.
- 🎮 **Discord Rich Presence (RPC)**: Automatically broadcasts anime title, episode name, poster art, and live elapsed/remaining countdown to your Discord profile.
- 🔍 **Universal Command Palette (`Ctrl + K`)**: Spotlight-style quick search popup for anime titles, navigation links, and settings.
- 🎨 **Anime Visual Enhancer (Shaders)**: Built-in real-time video color presets (*Vibrant Anime*, *Crisp Detail*, *Cinematic OLED*, *Warm Retro*) with persistent preference storage.
- 📥 **System Tray & Background Playback**: Minimize or close to system tray with quick context menu controls.
- 🎵 **OS Media Widget & Global Media Keys**: Full integration with Zorin OS / GNOME media player widgets, lock screens, and hardware keyboard media keys (`Play/Pause`, `Next`, `Prev`).
- 🛡️ **Built-in Ad & Tracker Shield**: Blocks video ads, analytics trackers, and telemetry scripts automatically.
- 🧭 **Glassmorphic App Bar**:
  - **Segmented Navigation**: Instant `◀ Back` (Alt+←), `Forward ▶` (Alt+→), `🔄 Reload`, and `🏠 Home` buttons with live history detection.
  - **Quick Links**: Direct shortcuts for **Explore**, **Simulcasts**, and **Watchlist**.
  - **Player Controls**: Speed cycling button, Picture-in-Picture trigger, and Auto-Skip toggle.
- ⚡ **Enhanced Player Automation**:
  - **Auto-Skip**: Automatically detects and triggers "Skip Intro" and "Skip Recap" prompts.
  - **Smart Auto-Next**: Automatically queues and plays next episodes seamlessly.
  - **Playback Speed**: Adjust speed dynamically in 0.25x steps (`[` and `]`) from 0.25x to 3.0x with on-screen visual toast.
  - **Picture-in-Picture (PiP)**: Dual-tier engine supporting native HTML5 PiP and Always-on-Top Floating Mini-Player window (`P`).
- 💤 **Power-Save Blocker**: Prevents system display sleep or screensavers while watching an episode.
- 🔒 **Zero-Reset Updates**: Account login, cookies, and watch history are completely preserved across all updates and restarts.

---

## ⌨️ Player & Navigation Shortcuts

| Shortcut | Description |
| :--- | :--- |
| **`Ctrl + K`** / **`Cmd + K`** | Open Spotlight Command Palette & Quick Search |
| **`Alt + ←`** / **`Alt + →`** | Navigate Page Back / Forward |
| **`[`** / **`]`** | Decrease / Increase playback speed (0.25x - 3.0x) |
| **`P`** | Toggle Picture-in-Picture / Floating Mini-Player |
| **`Space`** / **`K`** | Play / Pause video |
| **`F`** | Toggle Fullscreen mode |
| **`M`** | Mute / Unmute audio |
| **`Media Keys`** | Hardware Play/Pause, Next Track (+10s/Next), Prev Track (-10s) |

---

## 📦 Downloads & Installation

### 🐧 Linux (Zorin OS, Ubuntu, Debian, Fedora, Arch)
You can download the ready-to-run package from the [Releases](https://github.com/CodesRahul96/Crunchyroll-Desktop/releases) page:

- **AppImage** (Universal):
  ```bash
  chmod +x Crunchyroll-*.AppImage
  ./Crunchyroll-*.AppImage
  ```
- **Debian / Ubuntu / Zorin OS (.deb)**:
  ```bash
  sudo dpkg -i crunchyroll_*_amd64.deb
  ```

#### 🚀 Fast Local Installer
To install directly from this repository into your Application Menu:
```bash
chmod +x install.sh
./install.sh
```

---

### 🪟 Windows
1. Download `Crunchyroll-Setup.exe` from [Releases](https://github.com/CodesRahul96/Crunchyroll-Desktop/releases).
2. Run the installer and launch **Crunchyroll** from your Start Menu or Desktop.

---

### 🍏 macOS
1. Download `Crunchyroll-*.dmg` from [Releases](https://github.com/CodesRahul96/Crunchyroll-Desktop/releases).
2. Open the DMG and drag **Crunchyroll** into your `Applications` folder.

---

## 🛠️ Maintenance & CLI Utilities

The included [`install.sh`](install.sh) provides maintenance tools for Linux:

| Command | Action |
| :--- | :--- |
| `./install.sh` | Install for the current user (`~/.local/share/applications`) |
| `./install.sh --system` | Install system-wide (`/usr/share/applications`) |
| `./install.sh --repair` | Clear stale session locks and temporary render caches |
| `./install.sh --uninstall` | Cleanly remove desktop shortcuts and icon themes |

---

## 🏗️ Building From Source

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- `npm`

### Steps
```bash
# 1. Clone the repository
git clone https://github.com/CodesRahul96/Crunchyroll-Desktop.git
cd Crunchyroll-Desktop

# 2. Install dependencies
npm install

# 3. Start in development mode
npm start

# 4. Package for all platforms
npm run build:linux   # AppImage & .deb in /dist
npm run build:win     # Windows .exe installer in /dist
npm run build:mac     # macOS .dmg in /dist
```

---

## 📄 License & Disclaimer

- **License**: Released under the [MIT License](LICENSE).
- **Disclaimer**: This is an unofficial, open-source application and is not affiliated with, sponsored by, or endorsed by Crunchyroll, LLC or Sony Pictures Entertainment. All trademarks, anime titles, and logos belong to their respective owners.


