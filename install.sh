#!/bin/bash

set -e

APP_PATH="$(pwd)"
EXEC_PATH=""
MAIN_PATH="$APP_PATH/main.js"
ICON_PATH="$APP_PATH/resources/app/icon.png"

# Detect executable (custom electron binary, local node_modules, or system electron)
if [ -f "$APP_PATH/electron-widevine/electron" ]; then
  EXEC_PATH="$APP_PATH/electron-widevine/electron"
elif [ -f "$APP_PATH/node_modules/.bin/electron" ]; then
  EXEC_PATH="$APP_PATH/node_modules/.bin/electron"
elif command -v electron &> /dev/null; then
  EXEC_PATH="$(command -v electron)"
elif [ -f "$APP_PATH/dist/crunchyroll-desktop" ]; then
  EXEC_PATH="$APP_PATH/dist/crunchyroll-desktop"
fi

if [ -z "$EXEC_PATH" ] || [ ! -f "$MAIN_PATH" ]; then
  echo "⚠️  Note: Make sure to run 'npm install' or extract the packaged release before running install.sh."
fi

# Handle Uninstallation
if [ "$1" == "--uninstall" ] || [ "$1" == "-u" ]; then
  echo "🧹 Removing Crunchyroll desktop entries and icons..."
  rm -f "$HOME/.local/share/applications/crunchyroll.desktop"
  rm -f "$HOME/.local/share/applications/crunchyroll-desktop.desktop"
  rm -f "$HOME/.local/share/icons/hicolor/512x512/apps/crunchyroll.png"
  if [ -w "/usr/share/applications" ] || [ "$EUID" -eq 0 ]; then
    rm -f "/usr/share/applications/crunchyroll.desktop"
    rm -f "/usr/share/applications/crunchyroll-desktop.desktop"
    rm -f "/usr/share/icons/hicolor/512x512/apps/crunchyroll.png"
  fi
  update-desktop-database "$HOME/.local/share/applications" 2>/dev/null || true
  gtk-update-icon-cache -f -t "$HOME/.local/share/icons/hicolor" 2>/dev/null || true
  echo "✅ Crunchyroll uninstalled cleanly."
  exit 0
fi

# Handle Cache/Conflict Cleanup
if [ "$1" == "--clean" ] || [ "$1" == "--repair" ]; then
  echo "🔧 Resetting application cache and resolving conflict locks..."
  rm -f "$HOME/.config/Crunchyroll/SingletonLock" 2>/dev/null || true
  rm -rf "$HOME/.config/Crunchyroll/Cache" 2>/dev/null || true
  rm -rf "$HOME/.config/Crunchyroll/Code Cache" 2>/dev/null || true
  echo "✅ Stale session locks and caches cleared."
fi

# Clean up any obsolete desktop entries
rm -f "$HOME/.local/share/applications/crunchyroll-desktop.desktop"

# Install icon to user hicolor theme
mkdir -p "$HOME/.local/share/icons/hicolor/512x512/apps"
cp "$ICON_PATH" "$HOME/.local/share/icons/hicolor/512x512/apps/crunchyroll.png" 2>/dev/null || true

# Choose install target: User-level (~/.local/share/applications) or System-wide (/usr/share/applications)
if [ "$1" == "--system" ]; then
  DESKTOP_DIR="/usr/share/applications"
  DESKTOP_FILE="$DESKTOP_DIR/crunchyroll.desktop"
  echo "Installing system-wide to $DESKTOP_FILE..."
  
  # Install system icon
  sudo mkdir -p /usr/share/icons/hicolor/512x512/apps
  sudo cp "$ICON_PATH" /usr/share/icons/hicolor/512x512/apps/crunchyroll.png 2>/dev/null || true
  sudo rm -f "/usr/share/applications/crunchyroll-desktop.desktop"
  
  sudo tee "$DESKTOP_FILE" > /dev/null <<EOF
[Desktop Entry]
Name=Crunchyroll
GenericName=Anime Streaming Client
Exec=${EXEC_PATH:-electron} --no-sandbox $MAIN_PATH
Icon=$ICON_PATH
Terminal=false
Type=Application
Categories=AudioVideo;Video;Player;TV;Entertainment;
Keywords=anime;crunchyroll;streaming;video;japanese;tv;animation;
Comment=Unofficial Crunchyroll Desktop Client with Widevine DRM
StartupWMClass=crunchyroll
StartupNotify=true
EOF
  sudo update-desktop-database /usr/share/applications 2>/dev/null || true
  sudo gtk-update-icon-cache -f -t /usr/share/icons/hicolor 2>/dev/null || true
else
  DESKTOP_DIR="$HOME/.local/share/applications"
  mkdir -p "$DESKTOP_DIR"
  DESKTOP_FILE="$DESKTOP_DIR/crunchyroll.desktop"
  echo "Installing for current user to $DESKTOP_FILE..."
  tee "$DESKTOP_FILE" > /dev/null <<EOF
[Desktop Entry]
Name=Crunchyroll
GenericName=Anime Streaming Client
Exec=${EXEC_PATH:-electron} --no-sandbox $MAIN_PATH
Icon=$ICON_PATH
Terminal=false
Type=Application
Categories=AudioVideo;Video;Player;TV;Entertainment;
Keywords=anime;crunchyroll;streaming;video;japanese;tv;animation;
Comment=Unofficial Crunchyroll Desktop Client with Widevine DRM
StartupWMClass=crunchyroll
StartupNotify=true
EOF
  update-desktop-database "$DESKTOP_DIR" 2>/dev/null || true
  gtk-update-icon-cache -f -t "$HOME/.local/share/icons/hicolor" 2>/dev/null || true
fi

echo "✅ Crunchyroll installed successfully in Zorin OS! Find it in the Zorin Menu under 'Sound & Video'."

