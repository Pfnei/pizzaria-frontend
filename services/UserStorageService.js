// UserStorageService.js
import { AuthStorageService } from "./AuthStorageService.js";

const STORAGE_KEY = "user";

export class UserStorageService {

    static setUser(user) {
        if (!user) {
            this.clearUser();
            AuthStorageService.clearToken();
            return;
        }

        var previous = this.getUser();
        if (!previous) {
            previous = {};
        }

        var storedUser = {
            id: user.userId,
            email: user.email,
            username: user.username,
            firstname: user.firstname,
            lastname: user.lastname,
            active: user.active,
            admin: user.admin,
            avatarDataUrl: previous.avatarDataUrl ? previous.avatarDataUrl : ""
        };

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(storedUser));
        } catch (e) {
            console.error("Failed to save user:", e);
        }
    }

    static getUser() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return null;

            return JSON.parse(raw);
        } catch (err) {
            console.error("Failed to parse user:", err);
            return null;
        }
    }

    static save(user) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        } catch (e) {
            console.error("Failed to save user:", e);
        }
    }

    // ---------------- Avatar ----------------

    static setAvatarDataUrl(dataUrl) {
        var user = this.getUser();
        if (!user) return;

        user.avatarDataUrl = dataUrl;
        this.save(user);
    }

    static getAvatarDataUrl() {
        var user = this.getUser();
        if (user && user.avatarDataUrl) {
            return user.avatarDataUrl;
        }
        return null;
    }

    static clearAvatarDataUrl() {
        var user = this.getUser();
        if (!user) return;

        user.avatarDataUrl = "";
        this.save(user);
    }

    static async refreshAvatarFromServer() {
        // TODO: wenn du ein Avatar-Endpoint hast
    }

    // ---------------- Basics ----------------

    static getUserId() {
        var user = this.getUser();
        if (user && user.id) {
            return user.id;
        }
        return null;
    }

    static getUserInitials() {
        var user = this.getUser();
        if (!user) return "No User";

        var map = { "Ä": "A", "Ö": "O", "Ü": "U", "ä": "A", "ö": "O", "ü": "U", "ß": "S" };

        var first = "";
        var last = "";

        if (user.firstname && user.firstname.length > 0) {
            first = user.firstname.charAt(0);
        }

        if (user.lastname && user.lastname.length > 0) {
            last = user.lastname.charAt(0);
        }

        var fi = first ? (map[first] ? map[first] : first.toUpperCase()) : "";
        var li = last ? (map[last] ? map[last] : last.toUpperCase()) : "";

        var result = fi + li;

        return result !== "" ? result : "D";
    }

    static clearUser() {
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (e) {
            console.error("Failed to clear user:", e);
        }
    }

    static isLoggedIn() {
        var user = this.getUser();
        var token = AuthStorageService.getToken();

        if (user && token) return true;
        return false;
    }

    static isItemCreatedByUser(entityUserId) {
        var ownId = this.getUserId();
        if (ownId && entityUserId === ownId) return true;
        return false;
    }

    static isAdmin() {
        if (!this.isLoggedIn()) return false;

        var user = this.getUser();
        if (user && user.admin === true) {
            return true;
        }
        return false;
    }

    static getFullName() {
        var user = this.getUser();
        if (!user) return null;

        var fname = user.firstname ? user.firstname : "";
        var lname = user.lastname ? user.lastname : "";

        var full = fname + " " + lname;
        return full.trim();
    }
}
