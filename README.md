<div align="center">
  <img src="resources/app/icon.png" width="120" height="120" alt="Crunchyroll Desktop Logo" />
  <h1>Crunchyroll Desktop</h1>
  <p><strong>A sleek, high-performance desktop application for Linux, Windows, and macOS with Widevine DRM and Discord Rich Presence.</strong></p>

  <p>
    <a href="https://github.com/CodesRahul96/Crunchyroll-Desktop/releases"><img src="https://img.shields.io/github/v/release/CodesRahul96/Crunchyroll-Desktop?style=for-the-badge&color=ff6400&label=Latest%20Release" alt="Latest Release" /></a>
    <img src="https://img.shields.io/badge/Platform-Linux%20%7C%20Windows%20%7C%20macOS-blue?style=for-the-badge" alt="Supported Platforms" />
    <img src="https://img.shields.io/badge/Widevine-DRM%20Ready-2ea44f?style=for-the-badge" alt="Widevine DRM Ready" />
    <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-f1e05a?style=for-the-badge&labelColor=24292e" alt="MIT License" /></a>
  </p>
</div>

---

## 📖 Overview

**Crunchyroll Desktop** brings the complete anime streaming experience out of the cluttered browser tabs and into a standalone desktop client. Engineered for speed, stability, and aesthetic polish, it combines DRM-protected 1080p playback, real-time visual enhancement shaders, seamless Discord status broadcasting, and native desktop integration.

Whether you are marathon-watching the latest seasonal anime on **Linux**, **Windows**, or **macOS**, Crunchyroll Desktop gives you granular playback controls, instant navigation, and zero distractions.

---

## ✨ Key Highlights

### 🎬 Anime Streaming & Player Power
- **Widevine DRM Out-of-the-Box**: Full support for DRM-protected streams — crisp 1080p without browser DRM limitations.
- **Smart Auto-Skip & Auto-Next**: Automatically skips intros and recaps and seamlessly queues up the next episode.
- **Anime Visual Enhancer (Shaders)**: Instantly switch between custom post-processing presets (*Vibrant Anime*, *Crisp Detail*, *Cinematic OLED*, and *Warm Retro*).
- **Precision Speed Control**: Adjust playback rate in smooth `0.25x` increments (from `0.25x` to `3.0x`) with on-screen speed feedback.
- **Picture-in-Picture & Floating Mini-Player**: Watch anime in an always-on-top floating window while working or gaming (`P`).
- **Power-Save Blocker**: Automatically prevents system idle sleep and screensavers while video is playing.

### 🎮 Desktop Integration & Aesthetics
- **Native Instant Splash Screen**: Instant brand launch experience with zero blank white windows.
- **Discord Rich Presence (RPC)**: Automatically displays the anime title, episode number, poster thumbnail, and live playback timer on your Discord profile.
- **Universal Command Palette (`Ctrl + K` / `Cmd + K`)**: Quick-jump search for your favorite shows, simulcasts, and player settings.
- **Glassmorphic Quick Bar**: Seamless navigation with segmented history buttons (`Back`, `Forward`, `Reload`, `Home`), shortcuts for *Explore*, *Simulcasts*, and *Watchlist*, and visual speed toggles.
- **OS Media Center & Hardware Keys**: Integrated with system media controllers (Zorin OS / GNOME media applets, Windows Media Control, and macOS Now Playing) and hardware keyboard media keys.
- **System Tray Support**: Minimize to tray for quick background controls and instant summoning.
- **Built-in Ad & Tracker Shield**: Blocks disruptive video advertisements and background telemetry.
- **Zero-Reset Sessions**: Persistent session management preserves your account login and watch history across all updates.

---

## ⌨️ Keyboard & Navigation Shortcuts

| Shortcut | Action |
| :--- | :--- |
| **`Ctrl + K`** / **`Cmd + K`** | Open Spotlight Command Palette & Quick Search |
| **`Alt + ←`** / **`Alt + →`** | Navigate Page Back / Forward |
| **`[`** / **`]`** | Decrease / Increase playback speed (0.25x steps) |
| **`P`** | Toggle Picture-in-Picture / Floating Mini-Player |
| **`Space`** / **`K`** | Play / Pause video |
| **`F`** | Toggle Fullscreen mode |
| **`M`** | Mute / Unmute audio |
| **`Media Keys`** | Hardware Play/Pause, Next Track (+10s / Next), Prev Track (-10s) |

---

## 📦 Downloads & Installation

Pre-built binaries and installable packages for all platforms are available on the [GitHub Releases](https://github.com/CodesRahul96/Crunchyroll-Desktop/releases) page.

### 🐧 Linux (Zorin OS, Ubuntu, Debian, Fedora, Arch)

#### Option 1: Fast One-Line Installer (Recommended)
Clone the repository and run the automated installer:
```bash
git clone https://github.com/CodesRahul96/Crunchyroll-Desktop.git
cd Crunchyroll-Desktop
chmod +x install.sh
./install.sh
```

#### Option 2: Pre-built Packages
- **AppImage** (Universal Linux):
  ```bash
  chmod +x Crunchyroll-*.AppImage
  ./Crunchyroll-*.AppImage
  ```
- **Debian / Ubuntu / Zorin OS (.deb)**:
  ```bash
  sudo dpkg -i crunchyroll_*_amd64.deb
  ```

---

### 🪟 Windows
1. Download `Crunchyroll-Setup-*.exe` (or the portable `.exe`) from [Releases](https://github.com/CodesRahul96/Crunchyroll-Desktop/releases).
2. Run the installer and launch **Crunchyroll** from your Start Menu or Desktop shortcut.

---

### 🍏 macOS
1. Download `Crunchyroll-*.dmg` from [Releases](https://github.com/CodesRahul96/Crunchyroll-Desktop/releases).
2. Open the disk image and drag **Crunchyroll** into your `/Applications` folder.

---

## 🛠️ Maintenance & CLI Utilities (Linux)

The bundled [`install.sh`](install.sh) utility script provides one-stop maintenance commands:

```bash
./install.sh              # Install for current user (~/.local/share/applications)
sudo ./install.sh --system # Install globally for all users (/usr/share/applications)
./install.sh --repair     # Clear stale session locks and cache safely
./install.sh --uninstall  # Cleanly remove application shortcuts and icons
```

---

## 🏗️ Building From Source

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm` (bundled with Node.js)

### Build Steps
```bash
# 1. Clone the repository
git clone https://github.com/CodesRahul96/Crunchyroll-Desktop.git
cd Crunchyroll-Desktop

# 2. Install dependencies
npm install

# 3. Launch in development mode
npm start

# 4. Package for production
npm run build:linux   # AppImage & .deb in /dist
npm run build:win     # Windows .exe installer in /dist
npm run build:mac     # macOS .dmg in /dist
```

---

## 👨‍💻 Developer & Credits

Crafted with care by **Rahul**:

- **Developer**: [Rahul (@CodesRahul96)](https://github.com/CodesRahul96)
- **Repository**: [github.com/CodesRahul96/Crunchyroll-Desktop](https://github.com/CodesRahul96/Crunchyroll-Desktop)
- **Issues & Feedback**: [GitHub Issues](https://github.com/CodesRahul96/Crunchyroll-Desktop/issues)

If you enjoy using **Crunchyroll Desktop**, consider starring ⭐ the repository to support its continued development!

---

## 🤝 Contributing

Contributions, bug reports, and feature suggestions are warmly welcomed!
1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'feat: Add AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License & Legal Disclaimer

- **License**: Distributed under the [MIT License](LICENSE).
- **Disclaimer**: This is an **unofficial, community-developed application** and is not endorsed by, directly affiliated with, maintained, authorized, or sponsored by Crunchyroll, LLC, Sony Pictures Entertainment, or any of their affiliates. All product names, logos, anime titles, and brands are property of their respective owners.
