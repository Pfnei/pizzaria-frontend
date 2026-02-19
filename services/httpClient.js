import { authManager } from "./authManager.js";

export class CHttpClient {
  constructor(baseUrl) {
    this.baseUrl = String(baseUrl || "");
    this.readyPromise = null; // Versprechen für die dynamische Port-Suche
  }

  setBaseUrl(url) {
    this.baseUrl = String(url || "");
  }

  getBaseUrl() {
    return this.baseUrl;
  }

  joinUrl(...parts) {
    const clean = parts
        .filter(p => p !== null && p !== undefined)
        .map(p => String(p))
        .filter(s => s.length > 0);

    if (clean.length === 0) return this.baseUrl;

    const base = this.baseUrl.replace(/\/+$/, "");
    const rest = clean
        .map(s => s.replace(/^\/+|\/+$/g, ""))
        .join("/");

    return base + "/" + rest;
  }

  _buildHeaders(extraHeaders = {}) {
    return authManager.buildAuthHeaders({
      ...extraHeaders
    });
  }

  async request(method, path, options = {}) {
    // Falls die Port-Suche noch läuft, warten wir hier kurz
    if (this.readyPromise) {
      await this.readyPromise;
    }

    const { body, headers, ...fetchOptionsRest } = options;
    const url = this.joinUrl(path);

    const fetchOptions = {
      method,
      headers: this._buildHeaders(headers),
      ...fetchOptionsRest
    };

    if (body instanceof FormData) {
      delete fetchOptions.headers["Content-Type"];
      fetchOptions.body = body;
    } else if (body !== undefined) {
      fetchOptions.headers["Content-Type"] = "application/json";
      fetchOptions.body = JSON.stringify(body);
    }

    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      let message = `HTTP ${response.status}`;
      try {
        const json = text ? JSON.parse(text) : null;
        if (json && json.message) message = json.message;
      } catch {}
      throw new Error(message);
    }

    if (response.status === 204) {
      return null;
    }

    const ct = response.headers.get("Content-Type") || "";
    if (ct.includes("application/json")) {
      return await response.json();
    }

    return await response.blob();
  }

  get(path, options) { return this.request("GET", path, options); }
  post(path, body, options) { return this.request("POST", path, { ...(options || {}), body }); }
  patch(path, body, options) { return this.request("PATCH", path, { ...(options || {}), body }); }
  delete(path, options) { return this.request("DELETE", path, options); }
}

/**
 * INTELLIGENTE PORT-SUCHE
 * Prüft nacheinander 8081 (IDE) und 8082 (Docker).
 */
const discoverBackendUrl = async () => {
  const host = window.location.hostname;

  // 1. Spezialfall GitHub Codespaces
  if (host.includes("github.dev") || host.includes("app.github.dev")) {
    // Codespaces nutzt meistens 8082 für das Docker-Backend
    return window.location.origin.replace("-8080", "-8082");
  }

  // 2. Lokal: Wir testen 8082 (Docker) und 8081 (IDE)
  const ports = ["8082", "8081"];

  for (const port of ports) {
    try {
      const testUrl = `http://${host}:${port}`;

      // Kurzer Timeout-Check (500ms), damit die Suche nicht ewig dauert
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 500);

      // Wir pingen den Auth-Endpunkt (oder einen anderen öffentlichen Endpunkt)
      await fetch(`${testUrl}/auth/login`, {
        method: 'OPTIONS',
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      console.log(`%c✔ Backend auf Port ${port} gefunden.`, "color: #4CAF50; font-weight: bold;");
      return testUrl;
    } catch (e) {
      // Port antwortet nicht, versuche den nächsten
    }
  }

  // Fallback falls nichts gefunden wurde
  return `http://${host}:8081`;
};

// Instanz mit vorläufigem Standard erstellen
export const http = new CHttpClient("http://localhost:8081");

// Start der Suche und Blockierung von Requests bis Ergebnis da ist
http.readyPromise = discoverBackendUrl().then(url => {
  http.setBaseUrl(url);
  http.readyPromise = null; // Suche abgeschlossen
});