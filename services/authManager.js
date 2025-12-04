// authManager.js
export class CAuthManager {
  /**
   * @param {string} storageKey - Key im localStorage
   */
  constructor(storageKey = "auth") {
    this.storageKey = storageKey;
  }

  /**
   * Erwartet ein Objekt z.B.:
   * {
   *   token: "<JWT>",
   *   refreshToken?: "<REFRESH>",
   *   user: { ... }
   * }
   */
  saveAuth(authResponse) {
    if (!authResponse) return;

    const normalized = {
      token: authResponse.token || authResponse.accessToken || null,
      refreshToken: authResponse.refreshToken || null,
      user: authResponse.user || null
    };

    console.log("saveAuth:", normalized);
    localStorage.setItem(this.storageKey, JSON.stringify(normalized));
  }

  getAuth() {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) return null;

    try {
      return JSON.parse(raw);
    } catch (ex) {
      console.error("Failed to parse auth from localStorage", ex);
      return null;
    }
  }

  getToken() {
    const auth = this.getAuth();
    return auth ? auth.token : null;
  }

  getRefreshToken() {
    const auth = this.getAuth();
    return auth ? auth.refreshToken : null;
  }

  getUser() {
    const auth = this.getAuth();
    return auth ? auth.user : null;
  }

  /**
   * JWT-Payload auslesen (ohne Verifizierung!).
   * @returns {object | null} z.B. { exp, iat, userId, admin, ... }
   */
  decodeJwtPayload(token = this.getToken()) {
    if (!token) return null;

    const parts = token.split(".");
    if (parts.length !== 3) {
      console.error("Invalid JWT format");
      return null;
    }

    const base64 = parts[1];

    try {
      // base64url → base64
      const base64Padded = base64.replace(/-/g, "+").replace(/_/g, "/");
      const jsonString = atob(base64Padded);
      return JSON.parse(jsonString);
    } catch (err) {
      console.error("Failed to decode JWT payload", err);
      return null;
    }
  }

  /**
   * Prüft, ob das Token abgelaufen ist (exp aus JWT wird verwendet).
   * @returns {boolean|null} true = abgelaufen, false = gültig, null = kein Token / keine exp
   */
  isTokenExpired() {
    const token = this.getToken();
    if (!token) return null;

    const payload = this.decodeJwtPayload(token);
    if (!payload || !payload.exp) return null;

    const nowSeconds = Math.floor(Date.now() / 1000);
    return payload.exp <= nowSeconds;
  }

  /**
   * Gibt nur dann ein Token zurück, wenn es *nicht* abgelaufen ist.
   * Sonst null.
   */
  getValidToken() {
    const expired = this.isTokenExpired();
    if (expired === true) {
      console.warn("Token is expired.");
      return null;
    }
    return this.getToken();
  }

  /**
   * Praktische Helper für API-Calls:
   * Gibt dir ein fertiges Headers-Objekt für fetch zurück.
   */
  buildAuthHeaders(extraHeaders = {}) {
    const token = this.getValidToken();

    if (!token) {
      return {
        ...extraHeaders
      };
    }

    return {
      ...extraHeaders,
      Authorization: `Bearer ${token}`
    };
  }

  isLoggedIn() {
    const token = this.getValidToken();
    return !!token;
  }

  isAdmin() {
    const user = this.getUser();
    return !!(user && user.admin === true);
  }

  clearAuth() {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.error(error);
    }
  }
}

// Singleton-Instanz für die ganze App
export const authManager = new CAuthManager();
