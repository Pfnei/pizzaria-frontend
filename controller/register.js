'use strict';

import { api } from "../services/BaseApiService.js";
const apiUrl = "/auth/register";

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("registrationForm");
    if (form) {
        form.addEventListener("submit", handleSubmit);
    }

    setupDiversDetails();
});


// -------------------------------
// Divers details anzeigen/ausblenden
// -------------------------------
function setupDiversDetails() {
    var anredeEle = document.getElementById("anrede");
    var groupEle = document.getElementById("diversDetailsGroup");
    var detailsEle = document.getElementById("diversDetails");

    if (!anredeEle || !groupEle) {
        return;
    }

    function toggle() {
        if (anredeEle.value === "Divers") {
            groupEle.style.display = "block";
        } else {
            groupEle.style.display = "none";
            if (detailsEle) {
                detailsEle.value = "";
            }
        }
    }

    anredeEle.addEventListener("change", toggle);
    toggle();
}


// -------------------------------
// Form submit
// -------------------------------
async function handleSubmit(event) {
    event.preventDefault();

    var form = document.getElementById("registrationForm");
    var errorDiv = document.getElementById("errorDiv");
    var successDiv = document.getElementById("successMessage");

    if (errorDiv) errorDiv.textContent = "";
    if (successDiv) successDiv.style.display = "none";

    var dto = collectFormData();

    var validationError = validate(dto);
    if (validationError) {
        if (errorDiv) errorDiv.textContent = validationError;
        return;
    }

    try {
        
        const result =  await api.post(apiUrl, dto, { dataType: "text" });

        setTimeout(function () {
            window.location.href = "../views/login.html";
        }, 500);

    } catch (err) {
        if (errorDiv) errorDiv.textContent = "Netzwerkfehler oder Server nicht erreichbar.";
    }
}


// -------------------------------
// Form Daten einsammeln
// -------------------------------
function collectFormData() {
    var dto = {};

    var firstnameEle = document.getElementById("vorname");
    var lastnameEle = document.getElementById("nachname");
    var usernameEle = document.getElementById("username");
    var emailEle = document.getElementById("email");
    var telefonEle = document.getElementById("telefon");
    var passEle = document.getElementById("passwort");
    var passwdWdhEle = document.getElementById("passwortWdh");

    var anredeEle = document.getElementById("anrede");
    var diversEle = document.getElementById("diversDetails");
    var landEle = document.getElementById("land");

    // klassische if-Schreibweise
    dto.firstname = "";
    if (firstnameEle) dto.firstname = firstnameEle.value.trim();

    dto.lastname = "";
    if (lastnameEle) dto.lastname = lastnameEle.value.trim();

    dto.username = "";
    if (usernameEle) dto.username = usernameEle.value.trim();

    dto.email = "";
    if (emailEle) dto.email = emailEle.value.trim();

    dto.phoneNumber = "";
    if (telefonEle) dto.phoneNumber = telefonEle.value.trim();

    dto.password = "";
    if (passEle) dto.password = passEle.value;

    dto.passwordRepeat = "";
    if (passwdWdhEle) dto.passwordRepeat = passwdWdhEle.value;

    dto.salutation = null;
    if (anredeEle) dto.salutation = anredeEle.value;

    dto.salutationDetail = "";
    if (diversEle) dto.salutationDetail = diversEle.value.trim();

    dto.country = "";
    if (landEle) dto.country = landEle.value;

    return dto;
}


// -------------------------------
// SIMPLE VALIDIERUNG (optional)
// -------------------------------
function validate(dto) {

    if (!dto.firstname || dto.firstname.length < 3) {
        return "Vorname ungültig.";
    }

    if (!dto.lastname || dto.lastname.length < 2) {
        return "Nachname ungültig.";
    }

    if (!dto.username || dto.username.length < 5) {
        return "Username muss mindestens 5 Zeichen haben.";
    }

    if (!dto.email || dto.email.indexOf("@") === -1) {
        return "Ungültige Email.";
    }

    if (!dto.password || dto.password.length < 12) {
        return "Passwort muss mindestens 12 Zeichen haben.";
    }

    if (dto.password !== dto.passwordRepeat) {
        return "Passwörter stimmen nicht überein.";
    }

    if (dto.salutation === "Divers" && (!dto.salutationDetail || dto.salutationDetail.length < 3)) {
        return "Bitte Divers-Details ausfüllen.";
    }

    return null;
}
