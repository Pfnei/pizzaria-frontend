# 🍕 Pizzeria Frontend

Das Web-Frontend für das Pizzeria-Bestellsystem. Eine moderne Single-Page-Anwendung (SPA) Architektur, umgesetzt mit purem **Vanilla JavaScript**, HTML5 und CSS3.

---

## 🛠 Voraussetzungen & Tools

Dieses Projekt ist so konzipiert, dass es ohne komplexe Build-Tools auskommt. Ein einfacher Webserver genügt.

| Kategorie | Tool / Technik | Verwendung |
| :--- | :--- | :--- |
| **Basis** | HTML5 / CSS3 / JS (ES6+) | Grundgerüst und Logik |
| **Webserver** | ![Nginx](https://img.shields.io/badge/nginx-%23009639.svg?style=flat&logo=nginx&logoColor=white) | Auslieferung der statischen Dateien |
| **Container** | ![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=flat&logo=docker&logoColor=white) | Dockerisierte Laufzeitumgebung |
| **IDE** | WebStorm / VS Code / IntelliJ | Empfohlene Entwicklungsumgebungen |

---

## 📂 Projektstruktur

Das Projekt folgt einer modularen Trennung der Verantwortlichkeiten:

* **`views/`**: Die HTML-Templates für alle Seiten (Login, Menü, Admin, etc.).
* **`controller/`**: JS-Dateien, die die Logik der Views steuern und Events verarbeiten.
* **`services/`**: Kapselung der API-Kommunikation (LoginService, ProductService, etc.). Nutzt die `httpClient.js` als Basis.
* **`styles/`**: Modulare CSS-Stylesheets für jede Komponente.
* **`utils/`**: Hilfsfunktionen wie `cartStorage.js` (Warenkorb-Logik) und Validierungen.
* **`pictures/`**: Lokale Assets wie Logos, Hintergründe und Produktbilder.

---

## 🚀 Start mit Docker

Dank Docker lässt sich das Frontend mit einem einzigen Befehl starten, inklusive "Live-Reload" für die Entwicklung.

### 1. Container starten
Führe diesen Befehl im `pizzaria-frontend` Ordner aus:
```bash
docker compose up -d --build
