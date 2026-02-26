const urlbase = "/pizzaria-frontend/views"

export function getMainEndpoint(base = urlbase) {
    const url = new URL(window.location.href);
    return endpointFromPath(url.pathname, base);
}

export function getMainEndpointFromUrl(input, base = urlbase) {
    if (!input) return ""; 
    let url;
    try {
        url = (input instanceof URL) ? input : new URL(String(input), window.location.origin);
    } catch {
        return ""; 
    }
    return endpointFromPath(url.pathname, base);
}

function endpointFromPath(path, base) {
    if (base && path.startsWith(base)) path = path.slice(base.length);
    if (path.endsWith(".html")) path = path.slice(0, -5);
    const seg = path.split("/").filter(Boolean);
    return seg[0] || "";
}


// ep = Endpoint-String, z. B. "users"
export function isEndpoint(ep, base = urlbase) {
    return ep === getMainEndpoint(base);
}

// endpoints = Array von Strings, z. B. ["users", "orders"]
export function someEndpoint(endpoints, base = urlbase) {
    const current = getMainEndpoint(base);
    return Array.isArray(endpoints) && endpoints.includes(current);
}