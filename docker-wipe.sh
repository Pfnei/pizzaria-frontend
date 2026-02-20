#!/bin/bash

echo "======================================="
echo "   Docker Full Reset + Speichercheck   "
echo "======================================="

read -p "⚠️  Wirklich ALLES löschen? (y/N): " confirm
if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
    echo "Abgebrochen."
    exit 0
fi

echo ""
echo "📊 Speicherverbrauch VORHER:"
docker system df

# Gesamtgröße vorher (Bytes)
BEFORE=$(docker system df --format "{{.Size}}" | \
    awk '{sum+=$1} END {print sum}')

echo ""
echo "🔥 Starte kompletten Wipe..."

# Container stoppen & löschen
docker stop $(docker ps -aq) 2>/dev/null
docker rm $(docker ps -aq) 2>/dev/null

# Images löschen
docker rmi -f $(docker images -aq) 2>/dev/null

# Netzwerke
docker network prune -f

# Volumes (ACHTUNG: DB-Daten!)
docker volume prune -f

# Build Cache
docker builder prune -a -f

# Komplett-Prune
docker system prune -a --volumes -f

echo ""
echo "📊 Speicherverbrauch NACHHER:"
docker system df

# Gesamtgröße nachher (Bytes)
AFTER=$(docker system df --format "{{.Size}}" | \
    awk '{sum+=$1} END {print sum}')

FREED=$((BEFORE - AFTER))

echo ""
echo "======================================="
echo "💾 Freigegebener Speicher: $FREED Bytes"
echo "======================================="
