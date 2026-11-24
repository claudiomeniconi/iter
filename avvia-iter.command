#!/bin/bash
# Avvia l'app di Iter in locale (doppio clic dal Finder su macOS)
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
[ -s "$HOME/.nvm/nvm.sh" ] && . "$HOME/.nvm/nvm.sh"
cd "$(dirname "$0")/app" || exit 1

if ! command -v npm >/dev/null 2>&1; then
  echo "Node.js non è installato. Scaricalo da https://nodejs.org (versione LTS) e riapri questo file."
  read -r -p "Premi Invio per chiudere."
  exit 1
fi

if [ ! -d node_modules ] || [ package.json -nt node_modules ]; then
  echo "Installo le dipendenze (solo la prima volta)..."
  npm install --no-audit --no-fund || { read -r -p "Installazione fallita. Premi Invio per chiudere."; exit 1; }
fi

echo "Iter è su http://localhost:5173 (chiudi questa finestra per fermarlo)"
npm run dev
