'use strict';

import {userService} from "../services/userService.js";
import {authManager} from "../services/authManager.js";
import {fileService} from "../services/fileService.js";

let hasSubmittedForm = false;
let liveCheckFields = false;
let currentUserId = null;

initPage();

function initPage() {
    document.addEventListener('DOMContentLoaded', async () => {
        // Sicherheit: Muss eingeloggt sein
        if (!authManager.isLoggedIn()) {
            window.location.href = "../views/login.html";
            return;
        }

        const params = new URLSearchParams(window.location.search);
        currentUserId = params.get("id"); // Kann null sein

        // Admin-Elemente verstecken/deaktivieren für normale User
        if (!authManager.isAdmin()) {
            const adminSection = document.getElementById('adminSection'); // ID deines Containers im HTML
            if (adminSection) adminSection.style.display = 'none';

            // Falls keine Section da ist, direkt die Inputs deaktivieren
            const adminCb = document.getElementById('admin');
            const activeCb = document.getElementById('active');
            if (adminCb) adminCb.disabled = true;
            if (activeCb) activeCb.disabled = true;
        }

        const form = document.getElementById('userForm');
        if (typeof changeEnterToTab === "function") {
            changeEnterToTab(form);
        }

        setupDiversDetails();

        // USER LADEN (ID oder /me)
        await loadUser(currentUserId);

        // Events für Profilbild (jetzt ist currentUserId sicher gesetzt)
        const profileImage = document.getElementById('profileImage');
        const profileUploadInput = document.getElementById('profileUploadInput');

        profileImage?.addEventListener('click', () => profileUploadInput?.click());

        profileUploadInput?.addEventListener('change', async (event) => {
            const file = event.target.files[0];
            if (!file || !currentUserId) return;

            try {
                await fileService.uploadProfilePicture(currentUserId, file);
                if (profileImage.src.startsWith('blob:')) {
                    URL.revokeObjectURL(profileImage.src);
                }
                profileImage.src = URL.createObjectURL(file);
                console.log("Upload erfolgreich!");
            } catch (err) {
                console.error("Fehler beim Upload:", err);
            }
        });

        form?.addEventListener('submit', handleFormSubmit);
    });
}

async function loadUser(userId) {
    try {
        let user;
        if (userId) {
            // Admin-Modus: Lade fremden User per ID
            user = await userService.getById(userId);
        } else {
            // User-Modus: Lade eigenes Profil per /me
            user = await userService.getMe();
            currentUserId = user.userId; // Wichtig für den Upload & Update
        }

        if (!user) throw new Error("Benutzer nicht gefunden.");

        // Profilbild laden
        try {
            const blob = await fileService.downloadProfilePicture(user.userId);
            document.getElementById("profileImage").src = URL.createObjectURL(blob);
        } catch (e) {
            console.warn("Profilbild konnte nicht geladen werden");
        }

        // Formular befüllen
        setValue("anrede", user.salutation || "");
        setValue("diversDetails", user.salutationDetail || "");
        setValue("username", user.username || "");
        setValue("vorname", user.firstname || "");
        setValue("nachname", user.lastname || "");
        setValue("email", user.email || "");
        setValue("telefon", user.phoneNumber || "");
        setValue("adresse", user.address || "");
        setValue("plz", user.zipcode || "");
        setValue("ort", user.city || "");
        setValue("land", user.country || "");

        const activeEl = document.getElementById("active");
        if (activeEl) activeEl.checked = !!user.active;

        const adminEl = document.getElementById("admin");
        if (adminEl) adminEl.checked = !!user.admin;

        if (user.salutation === "MX") {
            const grp = document.getElementById('diversDetailsGroup');
            if (grp) grp.style.display = "block";
        }

    } catch (err) {
        console.error("Fehler beim Laden:", err);
        window.location.href = "../views/menu.html";
    }
}

async function saveUser() {
    if (!currentUserId) return;

    const isAdmin = authManager.isAdmin();
    const payload = {
        username: getVal("username"),
        firstname: getVal("vorname"),
        lastname: getVal("nachname"),
        email: getVal("email"),
        phoneNumber: getVal("telefon"),
        address: getVal("adresse"),
        city: getVal("ort"),
        zipcode: getVal("plz") || null,
        salutation: getVal("anrede") || null,
        salutationDetail: getVal("diversDetails") || null,
        country: getVal("land") || null,
        // Passwort nur mitschicken, wenn Feld ausgefüllt
        password: getVal("password") || null,
        // Status nur für Admins erlauben
        admin: isAdmin ? document.getElementById("admin")?.checked : null,
        active: isAdmin ? document.getElementById("active")?.checked : null
    };

    try {
        await userService.update(currentUserId, payload);
        showSuccessAndRedirect();
    } catch (err) {
        console.error("Fehler beim Speichern:", err);
    }
}

function setValue(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value;
}

function getVal(id) {
    const el = document.getElementById(id);
    return el ? el.value : "";
}

function handleFormSubmit(event) {
    event.preventDefault();
    if (validateForm()) saveUser();
}

function setupDiversDetails() {
    const anrede = document.getElementById('anrede');
    const detailsGroup = document.getElementById('diversDetailsGroup');
    if (!anrede || !detailsGroup) return;

    const toggle = () => {
        detailsGroup.style.display = (anrede.value === 'MX') ? 'block' : 'none';
    };
    anrede.addEventListener('change', toggle);
    toggle();
}

function validateForm() {
    // Deine validateStringInput Logik hier...
    return true; // Vereinfacht für dieses File
}

function showSuccessAndRedirect() {
    const msg = document.getElementById('successMessage');
    if (msg) msg.style.display = 'block';

    setTimeout(() => {
        // Admins zurück zur Liste, User zum Menü
        window.location.href = authManager.isAdmin() ? "../views/userlist.html" : "../views/menu.html";
    }, 1500);
}