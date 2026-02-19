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
    return authManager.buildAuthHeaders({ ...extraHeaders });
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

    if (response.status === 204) return null;

    const ct = response.headers.get("Content-Type") || "";
    if (ct.includes("application/json")) return await response.json();

    return await response.blob();
  }

  get(path, options) { return this.request("GET", path, options); }
  post(path, body, options) { return this.request("POST", path, { ...(options || {}), body }); }
  patch(path, body, options) { return this.request("PATCH", path, { ...(options || {}), body }); }
  delete(path, options) { return this.request("DELETE", path, options); }
}
/**
 * INTELLIGENTE URL-LOGIK
 * 1. Prüft auf Codespaces (Händisch oder Automatisch)
 * 2. Prüft auf Docker (8082)
 * 3. Fallback auf Lokal (8081)
 */
const getBaseUrl = () => {
  const host = window.location.hostname;
  const currentPort = window.location.port;

  // --- CODESPACE LOGIK ---
  if (host.includes("github.dev") || host.includes("app.github.dev")) {
    // Wenn du es händisch machen willst, kannst du hier deine URL eintragen:
    // return "https://dein-backend-8082.app.github.dev";

    // Oder automatisch (ersetzt den Frontend-Port 8080 durch Backend-Port 8081 oder 8082)
    return window.location.origin.replace("-8080", "-8082");
  }

  // --- LOKALE DOCKER LOGIK ---
  if (currentPort === "8080") {
    return `http://${host}:8082`;
  }

  // --- LOKALE IDE LOGIK ---
  return `http://${host}:8081`;
};

export const http = new CHttpClient(getBaseUrl());
console.log("%c📡 API-Ziel gesetzt auf: " + http.getBaseUrl(), "color: orange; font-weight: bold;");