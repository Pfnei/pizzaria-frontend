
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