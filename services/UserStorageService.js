const STORAGE_KEY = "user";

class UserStorageService {
    static setUser(data) {
        const prev = this.getUser() || {};
        const storedUser = {
            id: data?.user?.userId,
            email: data?.user?.email,
            username: data?.user?.username,
            firstname: data?.user?.firstname,
            lastname: data?.user?.lastname,
            isActive: data?.user?.active,
            isAdmin: data?.user?.admin,
            tokenExp: data?.authentication?.payload?.exp,
            // keep previous avatar if present (e.g., after refresh)
            avatarDataUrl: prev.avatarDataUrl ?? ""
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(storedUser));
    }

    static getUser() {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        try {
            return JSON.parse(raw);
        } catch (err) {
            console.error("Failed to parse user", err);
            return null;
        }
    }

    static save(user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    }

    // --- Avatar helpers ---
    /** Overwrite or set the cached avatar data URL for the logged-in user. */
    static setAvatarDataUrl(dataUrl) {
        const user = this.getUser();
        if (!user) return;
        user.avatarDataUrl = dataUrl;
        this.save(user);
    }

    static getAvatarDataUrl() {
        return this.getUser()?.avatarDataUrl;
    }

    /** Clear the cached avatar. */
    static clearAvatarDataUrl() {
        const u = this.getUser();
        if (!u) return;
        u.avatarDataUrl = "";
        this.save(u);
    }

    /**
     * Load the current user's avatar from the "attachments" service and cache it.
     * -------------------TODO write Method---------------
     */
    static async refreshAvatarFromServer() {
    }

    static getUserId() {
        return this.getUser()?.id;
    }

    static getUserInitials() {
        const user = this.getUser();
        if (!user) return "No User";
        const map = { Ä: "A", Ö: "O", Ü: "U", ä: "A", ö: "O", ü: "U", ß: "S" };
        const first = (user.firstname?.charAt(0) || "");
        const last = (user.lastname?.charAt(0) || "");
        const fi = (map[first] ?? f.toUpperCase());
        const li = (map[last] ?? l.toUpperCase());
        const res = `${fi}${li}`;
        return res || "D";  // D for Dummy
    }

    static clearUser() {
        localStorage.removeItem(STORAGE_KEY);
    }

    static isLoggedIn() {
        return !!this.getUser();
    }

    static isTokenNotExpired() {
        const user = this.getUser();
        if (!user || typeof user.tokenExp !== "number") return false;
        const now = Math.floor(Date.now() / 1000);
        return user.tokenExp > now;
    }

    static isItemCreatedByUser(entityUserId) {
        return entityUserId === this.getUserId();
    }

    static isAdmin()     { return this.getUser().user.isAdmin; }


        static getFullName() {
        const u = this.getUser();
        if (!u) return null;
        return `${u.firstname ?? ""} ${u.lastname ?? ""}`.trim();
    }
}
