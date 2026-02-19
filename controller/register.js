'use strict';


import {registerService} from "../services/registerService.js";


let hasSubmittedForm = false;
let liveCheckFields = false;

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("registrationForm");


    setupDiversDetails();
    changeEnterToTab(form);

    form.addEventListener('submit', handleFormSubmit);
});



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


function handleFormSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const isValid = validateForm();

    form.classList.add('was-validated');

    if (!hasSubmittedForm) {
        hasSubmittedForm = true;
        bindLiveValidation();
    }

    if (isValid) saveUser();

}


async function saveUser() {

    var payload = collectFormData();

    try {

        await registerService.register(payload);


        setTimeout(function () {
            window.location.href = "../views/login.html";
        }, 500);

    } catch (err) {
        console.error("Fehler bei der Registrierung:", err);
        const msgDiv = document.getElementById('successMessage');
        if (msgDiv) {
            msgDiv.textContent = 'Fehler bei der Registrierung! ';
            msgDiv.className = 'alert alert-danger mt-3';
            msgDiv.style = 'block';
            setTimeout(() => {
                msgDiv.textContent = ''
                msgDiv.className = '';
                msgDiv.style = 'none';
            }, 2000);

        } else {
            alert('Fehler bei der Registrierung!', err);
        }
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


    dto.salutation = null;
    if (anredeEle) dto.salutation = anredeEle.value;

    dto.salutationDetail = "";
    if (diversEle) dto.salutationDetail = diversEle.value.trim();

    dto.country = "";
    if (landEle) dto.country = landEle.value;

    return dto;
}

function validateForm() {
    let isFormValid = true;

    isFormValid = validateStringInput('vorname', false, 3, 30) && isFormValid;
    isFormValid = validateStringInput('nachname', false, 2, 100) && isFormValid;
    isFormValid = validateStringInput('username', true, 5, 30) && isFormValid;
    isFormValid = validateStringInput('email', true, 5, 100, false, false, false, true) && isFormValid;
    isFormValid = validateStringInput('telefon', false, 7, 30) && isFormValid;
    isFormValid = validateStringInput('plz', false, 2, 10) && isFormValid;
    isFormValid = validateStringInput('passwort', true, 8, 100 ,true, true,true) && isFormValid;
    isFormValid = validateStringInput('passwortWdh', true, 2,100,true, true,true) && isFormValid;

    console.log(isFormValid);

        isFormValid = checkPasswordEquality ('passwort','passwortWdh' )  && isFormValid;
        console.log(isFormValid);




    const detailsGroup = document.getElementById('diversDetailsGroup');
    if (detailsGroup && detailsGroup.style.display !== 'none') {
        isFormValid = validateStringInput('diversDetails', false, 4, 30) && isFormValid;
    } else {
        const details = document.getElementById('diversDetails');
        if (details && typeof clearValidation === "function") {
            clearValidation(details);
        }
    }
    return isFormValid;
}


function bindLiveValidation() {
    if (liveCheckFields) return;
    liveCheckFields = true;

    if (typeof validateStringInput !== "function") return;

    const validators = {
        vorname: () => validateStringInput('vorname', false, 3, 30),
        nachname: () => validateStringInput('nachname', false, 2, 100),
        username: () => validateStringInput('username', true, 5, 30),
        email: () => validateStringInput('email', true, 5, 100, false, false, false, true),
        telefon: () => validateStringInput('telefon', false, 7, 30),
        plz: () => validateStringInput('plz', false, 2, 10),
        passwort: () => {
            const a = validateStringInput('passwort', true, 8, 100, true, true, true, false);
            // beim Tippen im Passwort auch Gleichheit neu prüfen
            const b = checkPasswordEquality('passwort', 'passwortWdh');
            return a && b;
        },
        passwortWdh: () => checkPasswordEquality('passwort', 'passwortWdh'),
        diversDetails: () => {
            const grp = document.getElementById('diversDetailsGroup');
            if (grp && grp.style.display !== 'none') {
                return validateStringInput('diversDetails', false, 4, 30);
            } else {
                const details = document.getElementById('diversDetails');
                if (details && typeof clearValidation === "function") {
                    clearValidation(details);
                }
                return true;
            }
        }
    };

    Object.keys(validators).forEach((fieldId) => {
        const element = document.getElementById(fieldId);
        if (!element) return;

        const handler = () => {
            if (!hasSubmittedForm) return;
            validators[fieldId]();
        };

        if (element.tagName === 'SELECT') {
            element.addEventListener('change', handler);
        } else {
            element.addEventListener('input', handler);
            element.addEventListener('blur', handler);
        }
    });
}