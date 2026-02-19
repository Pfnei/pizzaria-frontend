#!/bin/bash

echo " Starte kompletten Docker-Wipe..."

# 1. Alle laufenden Container stoppen
echo "Stoppe alle Container..."
docker stop $(docker ps -aq) 2>/dev/null

# 2. Alle Container entfernen
echo " Entferne alle Container..."
docker rm $(docker ps -aq) 2>/dev/null

# 3. Alle ungenutzten Netzwerke löschen (behebt das "Resource still in use" Problem)
echo   Räume Netzwerke auf..."
docker network prune -f

# 4. Alle ungenutzten Volumes löschen (Vorsicht: Datenbank-Daten gehen verloren!)
echo "Lösche Volumes..."
docker volume prune -f

# 5. Build-Cache löschen (stellt sicher, dass JS-Änderungen wirklich übernommen werden)
echo " Leere Build-Cache..."
docker builder prune -f

echo " Alles sauber! Du kannst jetzt mit 'docker compose up --build -d' neu starten."
