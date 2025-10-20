const urlbase = "/pizzaria-frontend/views"

export function getMainEndpoint(base = urlbase) {
    const url = new URL(window.location.href);
    //console.log (url);
    let path = url.pathname;

    // removes base path
    if (base && path.startsWith(base)) path = path.slice(base.length);

    // removes .html
    if (path.endsWith(".html")) path = path.substring(0,path.length-5);

    const seg = path.split("/").filter(Boolean);
    return (seg[0] || ""); // "/" bei root
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