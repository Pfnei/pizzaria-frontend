// AuthStorageService.js

const TOKEN_KEY = "accessToken";

export class AuthStorageService {

    static setToken(token) {
        try {
            if (token !== null && token !== undefined) {
                localStorage.setItem(TOKEN_KEY, token);
            }
        } catch (e) {
            console.error("Failed to save token:", e);
        }
        return this;
    }

    static clearToken() {
        try {
            localStorage.removeItem(TOKEN_KEY);
        } catch (e) {
            console.error("Failed to clear token:", e);
        }
        return this;
    }

    static getToken() {
        try {
            var token = localStorage.getItem(TOKEN_KEY);
            if (token) {
                return token;
            }
        } catch (e) {
            console.error("Failed to read token:", e);
        }
        return null;
    }
}
