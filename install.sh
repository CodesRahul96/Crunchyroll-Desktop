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

# Step 1: Detect and close any running Crunchyroll instances for a clean restart
WAS_RUNNING=0
RUNNING_PIDS=$(pgrep -f "(electron|crunchyroll).*main\.js" 2>/dev/null || true)
if [ -n "$RUNNING_PIDS" ]; then
  echo "🔄 Detected running Crunchyroll instance(s). Closing for fresh restart..."
  WAS_RUNNING=1
  pkill -15 -f "(electron|crunchyroll).*main\.js" 2>/dev/null || true
  sleep 1
  pkill -9 -f "(electron|crunchyroll).*main\.js" 2>/dev/null || true
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
fi

# Step 2: Restart and refresh all desktop, icon, and menu services
echo "🔄 Refreshing system desktop services, icon caches, and menus..."
update-desktop-database "$HOME/.local/share/applications" 2>/dev/null || true
if [ -w "/usr/share/applications" ] || [ "$EUID" -eq 0 ]; then
  update-desktop-database /usr/share/applications 2>/dev/null || true
  gtk-update-icon-cache -f -t /usr/share/icons/hicolor 2>/dev/null || true
fi
gtk-update-icon-cache -f -t "$HOME/.local/share/icons/hicolor" 2>/dev/null || true
update-mime-database "$HOME/.local/share/mime" 2>/dev/null || true

# Step 3: Trigger menu refresh for GNOME Shell / Zorin Desktop
if command -v xdg-desktop-menu &> /dev/null; then
  xdg-desktop-menu forceupdate 2>/dev/null || true
fi

# Step 4: Relaunch app if it was running or if requested via --restart / -r
if [ "$WAS_RUNNING" -eq 1 ] || [ "$1" == "--restart" ] || [ "$2" == "--restart" ]; then
  echo "🚀 Relaunching Crunchyroll with updated services..."
  nohup "${EXEC_PATH:-electron}" --no-sandbox "$MAIN_PATH" > /dev/null 2>&1 &
fi

if command -v notify-send &> /dev/null; then
  notify-send -i "$ICON_PATH" "Crunchyroll" "Application updated and services refreshed successfully!" 2>/dev/null || true
fi

echo "✅ Crunchyroll installed & services restarted successfully in Zorin OS!"

