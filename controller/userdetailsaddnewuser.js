'use strict';

import { userService } from "../services/userService.js";
import { authManager } from "../services/authManager.js";
import { fileService } from "../services/fileService.js";

let hasSubmittedForm = false;
let liveCheckFields = false;
let currentUserId = null;

const BACKEND = "http://localhost:8081";

initPage();

function initPage() {
  document.addEventListener('DOMContentLoaded', async () => {


    const profileImage = document.getElementById('profileImage');
    const profileUploadInput = document.getElementById('profileUploadInput');

    profileImage.addEventListener('click', () => {
      if (profileUploadInput) profileUploadInput.click();
    });

  profileUploadInput.addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  try {
    // 1. Upload zum Server
    await fileService.uploadProfilePicture(currentUserId,file); 
    
    
    // 2. Alten Speicher (Blob-URL) im Browser freigeben
    if (profileImage.src.startsWith('blob:')) {
      URL.revokeObjectURL(profileImage.src);
    }

    // 3. Neue lokale Vorschau erstellen
    const localUrl = URL.createObjectURL(file);
    profileImage.src = localUrl;

    
    console.log("Upload erfolgreich!");

  } catch (err) {
    // Hier wird der Fehler gefangen, falls der Upload fehlschlägt
    console.error("Fehler beim Hochladen des Profilbilds:", err);
    console.log("Fehler beim Hochladen des Profilbilds.");
  }
});

   if (!authManager.isLoggedIn() || !authManager.isAdmin()) {
    window.location.href = "../views/menu.html";
    return;
   }

    const form = document.getElementById('userForm');
    if (!form) {
      console.error("userForm nicht gefunden");
      return;
    }

    if (typeof changeEnterToTab === "function") {
      changeEnterToTab(form);
    }

    setupDiversDetails();

   

    setForm();

    form.addEventListener('submit', handleFormSubmit);
  });
}


function setForm() {


    const activeEl = document.getElementById("active");
    activeEl.checked = true;

    const adminEl = document.getElementById("admin");
    adminEl.checked = false;
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


  const isAdmin = authManager.isAdmin();

  const activeEl = document.getElementById("active");
  const adminEl = document.getElementById("admin");

  const payload = {
    username: getVal("username"),
    firstname: getVal("vorname"),
    lastname: getVal("nachname"),

    admin: isAdmin && adminEl ? adminEl.checked : null,
    active: isAdmin && activeEl ? activeEl.checked : null,

    email: getVal("email"),
    phoneNumber: getVal("telefon"),
    address: getVal("adresse"),
    city: getVal("ort"),
    zipcode: getVal("plz") || null,

    salutation: getVal("anrede") || null,
    salutationDetail: getVal("diversDetails") || null,

    country: getVal("land") || null,

    password: getVal("passwort") || null,
  };

  try {
    await userService.create(payload);
    showSuccessAndRedirect();
  } catch (err) {
    console.error("Fehler beim Speichern:", err);
    console.log("Fehler beim Speichern: " + (err.message || err));
  }
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
  let isFormValid = true;



  isFormValid = validateStringInput('vorname', false, 3, 30) && isFormValid;
  isFormValid = validateStringInput('nachname', false, 2, 100) && isFormValid;
  isFormValid = validateStringInput('username', true, 5, 30) && isFormValid;
  isFormValid = validateStringInput('email', true, 5, 100, false, false, false, true) && isFormValid;
  isFormValid = validateStringInput('telefon', false, 7, 30) && isFormValid;
  isFormValid = validateStringInput('plz', false, 2, 10) && isFormValid;
  isFormValid =  validateStringInput('passwort', true, 8, 100, true, true, true, false) && isFormValid;
  isFormValid =  checkPasswordEquality('passwort','passwortWdh' ) && isFormValid;

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
    vorname:   () => validateStringInput('vorname', false, 3, 30),
    nachname:  () => validateStringInput('nachname', false, 2, 100),
    username:  () => validateStringInput('username', true, 5, 30),
    email:     () => validateStringInput('email', true, 5, 100, false, false, false, true),
    telefon:   () => validateStringInput('telefon', false, 7, 30),
    plz:       () => validateStringInput('plz', false, 2, 10),
    passwort:  () => {
      const a = validateStringInput('passwort', true, 8, 100, true, true, true, false);
      // beim Tippen im Passwort auch Gleichheit neu prüfen
      const b = checkPasswordEquality('passwort', 'passwortWdh');
      return a && b;
    },
    passwortWdh: () => checkPasswordEquality('passwort', 'passwortWdh'),
    // anrede:    () => validateSelectRequired('anrede'),
    // land:      () => validateSelectRequired('land'),
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

function showSuccessAndRedirect() {
  const msg = document.getElementById('successMessage');
  if (msg) msg.style.display = 'block';

  const btn = document.querySelector('#userForm button[type="submit"]');
  if (btn) btn.disabled = true;

   setTimeout(() => { window.location.href = "../views/menu.html";
  }, 1000);
}
