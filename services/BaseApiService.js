import { AuthStorageService } from "./AuthStorageService.js";
import {UserStorageService} from "./UserStorageService.js";

export class ApiClient {
    constructor(baseUrl) {
        this.baseUrl = String(baseUrl || "");
    }

    // ------- Configuration -------
    setBaseUrl(url) { this.baseUrl = String(url || ""); return this; }
    getBaseUrl()    { return this.baseUrl; }

    // ------- Helpers -------
    joinUrl(...parts) {
        const clean = parts
            .filter(p => p !== null && p !== undefined)
            .map(p => String(p))
            .filter(s => s.length > 0);
        if (clean.length === 0) return this.baseUrl;
        const base = this.baseUrl.replace(/\/+$/, "");
        const rest = clean.map(s => s.replace(/^\/+|\/+$/g, "")).join("/");
        return base + "/" + rest;
    }

    normalizeOptions(opts) {
        const out = Object.assign({headers: {}}, opts);
        const token = AuthStorageService.getToken();
        if (token && !out.headers.Authorization) {
            out.headers.Authorization = "Bearer " + token;
        }
        return out;
    }

    request(method, path, opts) {
        const options = this.normalizeOptions(opts);
        return $.ajax($.extend(true, {
            url: this.joinUrl(path), method: method, contentType: "application/json; charset=UTF-8", dataType: "json"
        }, options));
    }

    // ------- Basic HTTP methods -------
    get(path, options) {
        return this.request("GET", path, options);
    }

    post(path, body, options) {
        options = options || {};
        if (body !== undefined && options.data === undefined) {
            options.data = JSON.stringify(body);
        }
        return this.request("POST", path, options);
    }

    patch(path, body, options) {
        options = options || {};
        if (body !== undefined && options.data === undefined) {
            options.data = JSON.stringify(body);
        }
        return this.request("PATCH", path, options);
    }

    delete(path, body, options) {
        options = options || {};
        if (body !== undefined && options.data === undefined) {
            options.data = JSON.stringify(body);
        }
        return this.request("DELETE", path, options);
    }

    // ------- Convenience with ID -------
    // Example: getById("users", "123") -> GET {base}/users/123
    getById(resourceOrBasePath, id, options) {
        const encodedId = encodeURIComponent(String(id));
        return this.get(this.joinUrl(resourceOrBasePath, encodedId), options);
    }

    // Example: patchById("users", "123", { isActive: true })
    patchById(resourceOrBasePath, id, body, options) {
        const encodedId = encodeURIComponent(String(id));
        return this.patch(this.joinUrl(resourceOrBasePath, encodedId), body, options);
    }

    // Example: deleteById("users", "123")
    deleteById(resourceOrBasePath, id, options) {
        const encodedId = encodeURIComponent(String(id));
        return this.delete(this.joinUrl(resourceOrBasePath, encodedId), undefined, options);
    }


    //----------Error Messages--------------------

    extractErrorDetail(xhr) {
        // try to read JSON error payload (e.g., { message: "...", errors: [...] })
        try {
            if (xhr && xhr.responseJSON) {
                const j = xhr.responseJSON;
                if (j.message) return String(j.message);
                if (Array.isArray(j.errors) && j.errors.length) {
                    // take the first error entry
                    const first = j.errors[0];
                    // handle common shapes
                    if (typeof first === "string") return first;
                    if (first.defaultMessage) return first.defaultMessage;
                    if (first.message) return first.message;
                }
            }
            if (xhr && typeof xhr.responseText === "string" && xhr.responseText.trim()) {
                return xhr.responseText.trim();
            }
        } catch {}
        return null;
    }

    /**
     * Universal error handler for .fail(...)
     * Usage: .fail(api.handleError.bind(api))
     */
    handleError(xhr, textStatus, errorThrown, opts = {}) {
        const { redirectOn401 = true, silent = false } = opts;
        const status = xhr && typeof xhr.status === "number" ? xhr.status : 0;
        const detail = this.extractErrorDetail(xhr);
        // Xhr is not filled with suitable values
        const url = (xhr && xhr.responseURL) || (xhr && xhr?.settings?.url) || "";
        const method = (xhr && xhr?.settings?.type) || "";

        // Technical console logging --->  Xhr is not filled with suitable values
        console.error(
            "[API ERROR]",
            { status, textStatus, errorThrown, method, url, detail, xhr }
        );

        if (silent) return;

        if (status === 401) {
            alert("Sitzung abgelaufen oder nicht angemeldet. Bitte melden Sie sich erneut an.");
            if (redirectOn401) {
                try { AuthStorageService.clearToken(); UserStorageService.clearUser() } catch {}
                // adjust target if your login page differs
                window.location.href = "/login.html";
            }
            return;
        }
        if (status === 403) {
            alert("Keine Berechtigung, diese Aktion auszuführen.");
            return;
        }
        if (status === 404) {
            alert("Ressource nicht gefunden. Bitte melden Sie sich beim Administrator:");
            return;
        }
        if (status >= 500) {
            alert("Interner Serverfehler. Bitte später erneut versuchen.");
            return;
        }

        // Fallback message
        alert("Allgemeiner Fehler beim Laden der Daten.");
    }
}

// ---- Singleton
export const api = new ApiClient("http://localhost:8080");
