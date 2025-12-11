// services/httpClient.js
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
    // kein Content-Type Standard mehr!
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

    //  FormData muss unverändert bleiben
    if (body instanceof FormData) {
      delete fetchOptions.headers["Content-Type"];
      fetchOptions.body = body;
    } else if (body !== undefined) {
      fetchOptions.headers["Content-Type"] = "application/json";
      fetchOptions.body = JSON.stringify(body);
    }

    const response = await fetch(url, fetchOptions);

    // Fehlerbehandlung
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

    // JSON parsen
    const ct = response.headers.get("Content-Type") || "";
    if (ct.includes("application/json")) {
      return await response.json();
    }

    return await response.blob();
  }

  get(path, options) {
    return this.request("GET", path, options);
  }

  post(path, body, options) {
    return this.request("POST", path, { ...(options || {}), body });
  }

  patch(path, body, options) {
    return this.request("PATCH", path, { ...(options || {}), body });
  }

  delete(path, options) {
    return this.request("DELETE", path, options);
  }
}

const baseurlforconstructor = "http://localhost:8081";
export const http = new CHttpClient(baseurlforconstructor);