class ApiClient {
    constructor(baseUrl) {
        this.baseUrl = String(baseUrl || "");
    }

    // ------- Konfiguration -------
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
        const token = authStorage.getToken();
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

    // ------- Basis-HTTP-Methoden -------
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

    // ------- Convenience mit ID -------
    // Beispiel: getById("users", "123") -> GET {base}/users/123
    getById(resourceOrBasePath, id, options) {
        const encodedId = encodeURIComponent(String(id));
        return this.get(this.joinUrl(resourceOrBasePath, encodedId), options);
    }

    // patchById("users", "123", { isActive: true })
    patchById(resourceOrBasePath, id, body, options) {
        const encodedId = encodeURIComponent(String(id));
        return this.patch(this.joinUrl(resourceOrBasePath, encodedId), body, options);
    }

    // deleteById("users", "123")
    deleteById(resourceOrBasePath, id, options) {
        const encodedId = encodeURIComponent(String(id));
        return this.delete(this.joinUrl(resourceOrBasePath, encodedId), undefined, options);
    }
}

// ---- Singleton
window.api = new ApiClient("http://localhost:8080");

