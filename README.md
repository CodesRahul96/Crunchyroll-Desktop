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
- 🎨 **Interactive App Bar**:
  - **Navigation**: Instant `◀` Back, `▶` Forward, `🔄` Reload, and `🏠` Home buttons.
  - **Quick Links**: Direct shortcuts for **Explore**, **Simulcasts**, and **Watchlist**.
  - **Toolbar Controls**: Speed cycling button, Picture-in-Picture trigger, and Auto-Skip toggle.
  - **Smart Collapse**: Minimizable with a single click and automatically hides in fullscreen playback.
- 🌓 **Live Device Theme Sync**: Automatically detects and adapts to your OS Dark Mode or Light Mode (with special styling for Zorin OS & GNOME themes).
- ⚡ **Enhanced Player Controls**:
  - **Playback Speed**: Adjust speed dynamically in 0.25x steps (`[` and `]`) from 0.25x to 3.0x with on-screen visual toast.
  - **Picture-in-Picture (PiP)**: Pop video out into a floating, resizable window (`P`).
  - **Auto-Skip**: Automatically detects and triggers "Skip Intro" and "Skip Recap" prompts.
- 💤 **Power-Save Blocker**: Prevents system display sleep or screensavers while watching an episode.
- 🔒 **Zero-Reset Updates**: Account login, cookies, and watch history are completely preserved across all updates and restarts.
- 📌 **Taskbar & Dock Pinning**: Window grouping (`StartupWMClass`) properly associates with your pinned taskbar launcher in Zorin OS, Ubuntu, Windows, and macOS.

---

## ⌨️ Player Shortcuts

| Shortcut | Description |
| :--- | :--- |
| **`[`** | Decrease playback speed (down to 0.25x) |
| **`]`** | Increase playback speed (up to 3.0x) |
| **`P`** | Toggle Picture-in-Picture (PiP) mode |
| **`Space`** / **`K`** | Play / Pause video |
| **`F`** | Toggle Fullscreen mode |
| **`M`** | Mute / Unmute audio |
| **`▲` / `▼`** | Expand / Collapse the top App Bar |

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


