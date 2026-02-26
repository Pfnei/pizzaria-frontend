import { authManager } from "./authManager.js";

export class CHttpClient {
  constructor(baseUrl) {
    this.baseUrl = String(baseUrl || "");
  }

  setBaseUrl(url) {
    this.baseUrl = String(url || "");
  }

  joinUrl(...parts) {
    const clean = parts.filter(p => p != null).map(String);
    if (clean.length === 0) return this.baseUrl;
    const base = this.baseUrl.replace(/\/+$/, "");
    const rest = clean.map(s => s.replace(/^\/+|\/+$/g, "")).join("/");
    return base + "/" + rest;
  }

  _buildHeaders(extraHeaders = {}) {
    return authManager.buildAuthHeaders({ ...extraHeaders });
  }

  async request(method, path, options = {}) {
    const url = this.joinUrl(path);
    const { body, headers, ...rest } = options;
    const fetchOptions = {
      method,
      headers: this._buildHeaders(headers),
      ...rest
    };

    if (body instanceof FormData) {
      delete fetchOptions.headers["Content-Type"];
      fetchOptions.body = body;
    } else if (body !== undefined) {
      fetchOptions.headers["Content-Type"] = "application/json";
      fetchOptions.body = JSON.stringify(body);
    }

    const response = await fetch(url, fetchOptions);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    if (response.status === 204) return null;

    const ct = response.headers.get("Content-Type") || "";
    return ct.includes("application/json") ? await response.json() : await response.blob();
  }

  get(path, options) { return this.request("GET", path, options); }
  post(path, body, options) { return this.request("POST", path, { ...options, body }); }
  patch(path, body, options) { return this.request("PATCH", path, { ...options, body }); }
  delete(path, options) { return this.request("DELETE", path, options); }
}

/**
 * LOGIK FÜR LOKALE ENTWICKLUNG
 */
const getBaseUrl = () => {
  const host = window.location.hostname; // localhost
  const port = window.location.port;     // Frontend-Port

  // Szenario A: Frontend läuft im Docker (Port 8080) -> Backend ist Docker (8082)
  if (port === "8080") {
    return `http://${host}:8082`;
  }

  // Szenario B: Frontend läuft in IDE/Live-Server -> Backend ist IDE (8081)
  return `http://${host}:8081`;
};

export const http = new CHttpClient(getBaseUrl());
