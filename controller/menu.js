// menu.js
import { authManager } from "../services/authManager.js";

document.addEventListener("DOMContentLoaded", function () {
    const adminspace = document.getElementById('adminspace');
    if (!adminspace) return;

    // authManager hat bereits eine Funktion dafür
    if (authManager.isAdmin()) {
        adminspace.style.display = "block";
    } else {
        adminspace.style.display = "none";
    }
});
