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

# Clean up any obsolete desktop entries
rm -f "$HOME/.local/share/applications/crunchyroll-desktop.desktop"

# Choose install target: User-level (~/.local/share/applications) or System-wide (/usr/share/applications)
if [ "$1" == "--system" ]; then
  DESKTOP_DIR="/usr/share/applications"
  DESKTOP_FILE="$DESKTOP_DIR/crunchyroll.desktop"
  echo "Installing system-wide to $DESKTOP_FILE..."
  sudo rm -f "/usr/share/applications/crunchyroll-desktop.desktop"
  sudo tee "$DESKTOP_FILE" > /dev/null <<EOF
[Desktop Entry]
Name=Crunchyroll
Exec=${EXEC_PATH:-electron} $MAIN_PATH
Icon=$ICON_PATH
Terminal=false
Type=Application
Categories=AudioVideo;Video;Player;
Comment=Unofficial Crunchyroll Desktop Client
StartupWMClass=crunchyroll
EOF
  sudo update-desktop-database /usr/share/applications 2>/dev/null || true
else
  DESKTOP_DIR="$HOME/.local/share/applications"
  mkdir -p "$DESKTOP_DIR"
  DESKTOP_FILE="$DESKTOP_DIR/crunchyroll.desktop"
  echo "Installing for current user to $DESKTOP_FILE..."
  tee "$DESKTOP_FILE" > /dev/null <<EOF
[Desktop Entry]
Name=Crunchyroll
Exec=${EXEC_PATH:-electron} $MAIN_PATH
Icon=$ICON_PATH
Terminal=false
Type=Application
Categories=AudioVideo;Video;Player;
Comment=Unofficial Crunchyroll Desktop Client
StartupWMClass=crunchyroll
EOF
  update-desktop-database "$DESKTOP_DIR" 2>/dev/null || true
fi

echo "✅ Crunchyroll shortcut installed successfully! Find it in your Application Menu."

