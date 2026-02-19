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
 * DYNAMISCHE URL-ERMITTLUNG
 * Prüft auf Codespaces, Docker-Ports und lokale Entwicklung.
 */
const getBaseUrl = () => {
  // Wir definieren die möglichen Ports
  const DOCKER_BACKEND_PORT = "8082";
  const LOCAL_BACKEND_PORT = "8081";

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    const protocol = window.location.protocol;

    // 1. Logik für GitHub Codespaces
    if (host.includes("github.dev") || host.includes("app.github.dev")) {
      // In Codespaces gehen wir davon aus, dass du das "fully-dockerized" Setup nutzt (8082)
      // Falls nicht, erkennt man das leider schwer automatisch ohne Request-Check.
      // Wir nehmen hier den Standard-Docker-Port für Codespaces:
      return window.location.origin.replace("-8080", `-${DOCKER_BACKEND_PORT}`);
    }

    // 2. Logik für Lokal (Browser greift auf localhost zu)
    if (host === "localhost" || host === "127.0.0.1") {
      /* HINWEIS: Da JS im Browser nicht "riechen" kann, welcher Port offen ist,
         müssen wir uns hier für einen Standard entscheiden oder eine Logik bauen.

         Strategie: Wenn das Frontend selbst auf Port 8080 läuft (Docker),
         will es meistens auf das Docker-Backend (8082).
      */
      const frontendPort = window.location.port;
      const targetBackendPort = (frontendPort === "8080") ? DOCKER_BACKEND_PORT : LOCAL_BACKEND_PORT;

      return `${protocol}//${host}:${targetBackendPort}`;
    }

    // Fallback für andere Setups
    return `${protocol}//${host}:${DOCKER_BACKEND_PORT}`;
  }

  return `http://localhost:${LOCAL_BACKEND_PORT}`;
};

// Instanz mit der dynamischen URL exportieren
export const http = new CHttpClient(getBaseUrl());