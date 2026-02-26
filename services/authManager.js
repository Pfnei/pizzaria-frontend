import {clearCart} from "../utils/cartStorage.js";

export class CAuthManager {

  constructor(storageKey = "auth") {
    this.storageKey = storageKey;
  }


  saveAuth(authResponse) {
    if (!authResponse) return;

    const normalized = {
      token: authResponse.token || authResponse.accessToken || null,
      refreshToken: authResponse.refreshToken || null,
      user: authResponse.user || null
    };

    localStorage.setItem(this.storageKey, JSON.stringify(normalized));
  }

  getAuth() {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) return null;

    try {
      return JSON.parse(raw);
    } catch (ex) {
      return null;
    }
  }

  getToken() {
    const auth = this.getAuth();
    return auth ? auth.token : null;
  }


  getUser() {
    const auth = this.getAuth();
    return auth ? auth.user : null;
  }

  getUserId() {
    const auth = this.getAuth();
    return auth ? auth.user.userId : null;
  }


  decodeJwtPayload(token = this.getToken()) {
    if (!token) return null;

    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    const base64 = parts[1];

    try {
      const base64Padded = base64.replace(/-/g, "+").replace(/_/g, "/");
      const jsonString = atob(base64Padded);
      return JSON.parse(jsonString);
    } catch (err) {
      return null;
    }
  }


  isTokenExpired() {
    const token = this.getToken();
    if (!token) return null;

    const payload = this.decodeJwtPayload(token);
    if (!payload || !payload.exp) return null;

    const nowSeconds = Math.floor(Date.now() / 1000);
    return payload.exp <= nowSeconds;
  }


  getValidToken() {
    const expired = this.isTokenExpired();
    if (expired === true) {
      return null;
    }
    return this.getToken();
  }


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
      clearCart();
    } catch (error) {
    }
  }
}


export const authManager = new CAuthManager();
