// menu.js
import { UserStorageService } from "../services/UserStorageService.js";


document.addEventListener("DOMContentLoaded", function () {
    var adminspace = document.getElementById('adminspace');
    if (!adminspace) {
        return;
    }

    if (UserStorageService.isAdmin()) {
        adminspace.style.display = "block";
    } else {
        adminspace.style.display = "none";
    }
});
