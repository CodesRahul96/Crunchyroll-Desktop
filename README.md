<h1 align="center">Crunchyroll Desktop</h1>
<p align="center">
  <strong>An unofficial cross-platform Crunchyroll desktop app for Linux, Windows, and macOS</strong> 🎬
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Platform-Linux%20%7C%20Windows%20%7C%20macOS-blue?style=flat-square" alt="Platform">
  <img src="https://img.shields.io/badge/DRM-Widevine%20Supported-green?style=flat-square" alt="DRM">
  <img src="https://img.shields.io/badge/License-MIT-orange?style=flat-square" alt="License">
</p>

---

## ⚡ Features

- 🌐 **Cross-Platform Support**: Seamless experience across **Linux** (AppImage, Deb), **Windows** (Installer & Portable .exe), and **macOS** (DMG & Zip).
- 🔓 **Widevine DRM Support**: DRM media playback supported out-of-the-box.
- ⚡ **Enhanced Video Controls**:
  - `[` / `]`: Adjust playback speed dynamically in 0.25x increments with on-screen indicator.
  - `P`: Toggle Picture-in-Picture (PiP) mode on the active video.
  - Auto-skip Intro and Recap buttons.
- 💤 **Power-Save Blocker**: Automatically prevents system display sleep or screensavers while watching episodes.
- 🔒 **Security & Sandboxing**: Context isolation, sandboxed processes, and secure external URL handling (external links automatically open in your default browser).
- 🎨 **Clean UI**: Custom dark-mode scrollbars with a distraction-free window.

---

## ⌨️ Player Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `[` | Decrease playback speed (down to 0.25x) |
| `]` | Increase playback speed (up to 3.0x) |
| `P` | Toggle Picture-in-Picture (PiP) |
| `Space` / `K` | Play / Pause |
| `F` | Fullscreen |
| `M` | Mute / Unmute |

---

## 📦 Installation & Download

### 🐧 Linux
1. Download the latest `.AppImage` or `.deb` from the [Releases](https://github.com/CodesRahul96/Crunchyroll-Desktop/releases) section.
2. For AppImage:
   ```bash
   chmod +x Crunchyroll-Desktop-*.AppImage
   ./Crunchyroll-Desktop-*.AppImage
   ```
3. Or install the desktop shortcut using the provided script:
   ```bash
   chmod +x install.sh
   ./install.sh
   ```

### 🪟 Windows
1. Download the latest `Crunchyroll-Desktop-Setup.exe` from [Releases](https://github.com/CodesRahul96/Crunchyroll-Desktop/releases).
2. Run the installer and launch from your Start Menu.

### 🍏 macOS
1. Download the `.dmg` from [Releases](https://github.com/CodesRahul96/Crunchyroll-Desktop/releases).
2. Open the DMG and drag `Crunchyroll Desktop` to your `Applications` folder.

---

## 🛠️ Building From Source

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm`

### Steps
```bash
# 1. Clone the repository
git clone https://github.com/CodesRahul96/Crunchyroll-Desktop.git
cd Crunchyroll-Desktop

# 2. Install dependencies
npm install

# 3. Run in development mode
npm start

# 4. Build for your current platform
npm run dist

# Or build for specific targets:
npm run build:linux  # Generates AppImage & .deb in /dist
npm run build:win    # Generates .exe in /dist
npm run build:mac    # Generates .dmg in /dist
```

---

## ⚠️ Disclaimer
This is an unofficial application and is not affiliated with or endorsed by Crunchyroll, LLC. All content, trademarks, and logos are the property of their respective owners.

