//import {api} from "../services/BaseApiService.js";
//import {UserStorageService} from "../services/UserStorageService.js";
//import {AuthStorageService} from "../services/AuthStorageService.js";

import { authManager } from "../services/authManager.js";
import { loginService } from "../services/loginService.js";




$(document).ready(function () {
    trySilentLogin();
    registerEventsLogin();
});

function registerEventsLogin() {
    $('#loginForm').on('submit', function (e) {
        e.preventDefault();
        const $email = $('#email').val().trim();
        const $password = $('#password').val();
        if ($email && $password) {
            login($email, $password);
        } else {
            alert('Bitte alle Felder ausfüllen.');
        }
    });
    //  (Back/Forward) - necessary when page is accessed via (Back/Forward)
    window.addEventListener('pageshow', function (e) {
        trySilentLogin();
    });
}

async function login(email, password) {
  try {
    const data = await loginService.login(email, password);
    console.log("Login-Response data:", data);

    if (!data) {
      alert("Login fehlgeschlagen.");
      return;
    }

    // Auth-Objekt in den authManager speichern
    const auth = {
      token: data.accessToken || data.token,
      user: data.user
    };

    authManager.saveAuth(auth);

    // Weiterleitung ins Menü
    window.location.href = "../views/menu.html";
  } catch (err) {
    console.error("Login error:", err);
    alert("Login fehlgeschlagen.");
  }
}

/**
 * Versucht, mit vorhandenen Token/User-Daten automatisch einzuloggen.
 * - Prüft, ob ein **gültiges** Token existiert
 * - Fragt beim Backend nach, ob der User noch ok ist
 * - Leitet bei Erfolg direkt weiter
 */
async function trySilentLogin() {
  console.log("trySilentLogin()…");

  // 1. Gültiges Token holen (inkl. Expiry-Check)
  const token = authManager.getValidToken();
  if (!token) {
    console.log("Kein gültiges Token gefunden → Silent Login abgebrochen");
    return;
  }

  // 2. User aus dem authManager holen
  const storedUser = authManager.getUser();
  if (!storedUser || !storedUser.id) {
    console.warn("Kein User im Storage → Auth wird geleert");
    authManager.clearAuth();
    return;
  }

  const userId = storedUser.id;
  // Achtung: Slash ergänzt
  const path = `/auth/login/${userId}`; // ggf. Route an dein Backend anpassen

  try {
    // Falls dein api.get(headers unterstützt):
    const response = await loginService.getById(userId);
    console.log("Silent Login - User-Daten vom Server:", response);

    // Je nach API-Response kann das direkt der User sein oder ein Objekt { user: ... }
    const user = response.user || response;

    // User-Daten im authManager aktualisieren (Token behalten)
    authManager.saveAuth({
      token,
      user
    });

    console.log("Silent Login erfolgreich:", user);

    window.location.href = "../views/menu.html";
  } catch (err) {
    console.error("Silent Login fehlgeschlagen:", err);
    authManager.clearAuth();
  }
}