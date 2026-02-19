import { authManager } from "./authManager.js";

export class CHttpClient {
  constructor(baseUrl) {
    this.baseUrl = String(baseUrl || "");
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
 * DYNAMISCHE URL-ERMITTLUNG MIT AUTO-PROBE
 */
const discoverBackendUrl = async () => {
  const host = window.location.hostname;

  // 1. Spezialfall: GitHub Codespaces
  if (host.includes("github.dev") || host.includes("app.github.dev")) {
    // In Codespaces ist 8082 meist der Standard für Docker-Backend
    return window.location.origin.replace("-8080", "-8082");
  }

  // 2. Lokal: Wir testen 8081 und 8082 parallel
  const ports = ["8081", "8082"];

  // Wir erstellen für jeden Port einen kleinen Test-Request (Ping)
  const checks = ports.map(async (port) => {
    try {
      const url = `http://${host}:${port}`;
      // mode: 'no-cors' reicht uns, um zu sehen ob der Port "lebt"
      await fetch(`${url}/auth/login`, { method: 'OPTIONS', mode: 'cors' });
      return url;
    } catch (e) {
      return null;
    }
  });

  // Wir warten, welcher Port zuerst antwortet
  const results = await Promise.all(checks);
  const activeUrl = results.find(url => url !== null);

  if (activeUrl) {
    console.log("Backend gefunden auf:", activeUrl);
    return activeUrl;
  }

  // Fallback falls gar nichts antwortet
  console.warn("Kein Backend gefunden, nutze Standard 8081");
  return `http://${host}:8081`;
};

// Instanz mit temporärer URL (wird sofort überschrieben)
export const http = new CHttpClient("http://localhost:8081");

// Starte die Suche und update die Instanz
discoverBackendUrl().then(url => {
  http.setBaseUrl(url);
});