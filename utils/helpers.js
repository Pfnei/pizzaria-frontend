
export function formatDate(iso) {
    if (!iso) return "";

    const date = new Date(iso);

    if (isNaN(date.getTime())) return "";

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}.${month}.${year}`;
}


export function formatUserName(user) {
    if (!user) return "";

    const first = user.firstname?.trim() || "";
    const last = user.lastname?.trim() || "";

    if (!first && !last) return "";

    return `${first} ${last}`.trim();
}


export function sortList(list, key, asc) {
    const copy = list.slice();
    copy.sort(function (a, b) {
        return compareValues(a[key], b[key], asc);
    });
    return copy;
}


function compareValues(va, vb, asc) {
    va = handleDataTypes(va);
    vb = handleDataTypes(vb);
    if (va === vb) return 0;
    const result = va > vb ? 1 : -1;
    return asc ? result : -result;
}

function handleDataTypes(v) {
    if (v == null) return "";
    if (typeof v === "boolean") return v ? 1 : 0;
    if (typeof v === "number") return v;
    if (typeof v === "string") {
        const trimmed = v.trim();

        const isNotEmpty = trimmed !== "";
        const asNumber = Number(trimmed);
        const isValidNumber = !isNaN(asNumber);

        if (isNotEmpty && isValidNumber) {
            return asNumber;
        }
        return trimmed.toLowerCase();
    }
    return String(v).toLowerCase();
}