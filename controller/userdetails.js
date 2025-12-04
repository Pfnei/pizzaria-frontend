'use strict';

import { userService } from "../services/userService.js";
import { authManager } from "../services/authManager.js";

let hasSubmittedForm = false;
let liveCheckFields = false;
let currentUserId = null;

initPage();

function initPage() {
  document.addEventListener('DOMContentLoaded', async () => {
 
    if (!authManager.isLoggedIn() || !authManager.isAdmin()) {
      window.location.href = "../views/menu.html";
      return;
    }

    const form = document.getElementById('userForm');
    if (!form) {
      console.error("userForm nicht gefunden");
      return;
    }

    // Helper aus Utils (global eingebunden)
    if (typeof changeEnterToTab === "function") {
      changeEnterToTab(form);
    }

    setupDiversDetails(); // MX → extra-Details

    // ID aus URL lesen: ?id=123
    const params = new URLSearchParams(window.location.search);
    const idFromUrl = params.get("id");

    if (!idFromUrl) {
      console.warn("Keine id in der URL, leite zurück.");
      window.location.href = "../views/menu.html";
      return;
    }

    currentUserId = idFromUrl;

    await loadUser(currentUserId);

    form.addEventListener('submit', handleFormSubmit);
  });
}

async function loadUser(userId) {
  try {
    const user = await userService.getById(userId);
    console.log("User für Details geladen:", user);

    if (!user) {
      alert("Benutzer wurde nicht gefunden.");
      window.location.href = "../views/menu.html";
      return;
    }

 

    // MR / MS / MX
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

    // AT / DE / CH / ...
    setValue("land", user.country || "");

    const activeEl = document.getElementById("active");
    if (activeEl) activeEl.checked = !!user.active;

    const adminEl = document.getElementById("admin");
    if (adminEl) adminEl.checked = !!user.admin;

    // Divers-Details sichtbar machen, falls MX gesetzt ist
    const anrede = document.getElementById('anrede');
    if (anrede && anrede.value === "MX") {
      const grp = document.getElementById('diversDetailsGroup');
      if (grp) grp.style.display = "block";
    }

  } catch (err) {
    console.error("Fehler beim Laden des Benutzers:", err);

   window.location.href = "../views/menu.html";
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
  const form = event.target;
  const isValid = validateForm();

  form.classList.add('was-validated');

  if (!hasSubmittedForm) {
    hasSubmittedForm = true;
    bindLiveValidation();
  }

  if (isValid) {
    saveUser();
  }
}

async function saveUser() {
  if (!currentUserId) {
    alert("Keine Benutzer-ID vorhanden.");
    return;
  }

  const isAdmin = authManager.isAdmin(); // zur Sicherheit, auch wenn Seite admin-only ist

  const activeEl = document.getElementById("active");
  const adminEl  = document.getElementById("admin");

  const payload = {
    username: getVal("username"),
    firstname: getVal("vorname"),
    lastname: getVal("nachname"),

    // Nur Admin darf im Backend wirklich ändern, aber schicken ist ok
    admin: isAdmin && adminEl ? adminEl.checked : null,
    active: isAdmin && activeEl ? activeEl.checked : null,

    email: getVal("email"),
    phoneNumber: getVal("telefon"),
    address: getVal("adresse"),
    city: getVal("ort"),
    zipcode: getVal("plz"),

    salutation: getVal("anrede") || null,          // MR / MS / MX
    salutationDetail: getVal("diversDetails") || null,

    country: getVal("land") || null,               // AT / DE / ...

    password: null                                 // kein Passwort hier
  };

  console.log("Update-Payload:", payload);

  try {
    await userService.update(currentUserId, payload);
    showSuccessAndRedirect();
  } catch (err) {
    console.error("Fehler beim Speichern des Benutzers:", err);
    alert("Fehler beim Speichern der Benutzerdaten: " + (err.message || err));
  }
}

/* ----- Divers-Logik, Validierung, Live-Check ----- */

function setupDiversDetails() {
  const anrede = document.getElementById('anrede');
  const detailsGroup = document.getElementById('diversDetailsGroup');
  const detailsInput = document.getElementById('diversDetails');

  if (!anrede || !detailsGroup) return;

  const toggle = () => {
    // Enum: MR / MS / MX
    if (anrede.value === 'MX') {
      detailsGroup.style.display = 'block';
    } else {
      detailsGroup.style.display = 'none';
      if (detailsInput) {
        detailsInput.value = '';
        if (typeof clearValidation === "function") {
          clearValidation(detailsInput);
        }
      }
    }
  };

  anrede.addEventListener('change', toggle);
  toggle();
}

function validateForm() {
  let isFormValid = true;

  if (typeof validateStringInput !== "function") {
    // falls Validation-Script nicht geladen ist: nicht crashen
    return true;
  }

  isFormValid = validateStringInput('vorname', false, 3, 30) && isFormValid;
  isFormValid = validateStringInput('nachname', false, 2, 100) && isFormValid;
  isFormValid = validateStringInput('username', true, 5, 30) && isFormValid;
  isFormValid = validateStringInput('email', true, 5, 100, false, false, false, true) && isFormValid;
  isFormValid = validateStringInput('telefon', false, 7, 30) && isFormValid;
  isFormValid = validateStringInput('plz', false, 2, 10) && isFormValid;

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
  if (msg) {
    msg.style.display = 'block';
  }

  const btn = document.querySelector('#userForm button[type="submit"]');
  if (btn) btn.disabled = true;

  setTimeout(() => {
    window.location.href = "../views/menu.html";
  }, 1000);
}
