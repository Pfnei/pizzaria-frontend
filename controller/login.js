"use strict";

import {authManager} from "../services/authManager.js";
import {loginService} from "../services/loginService.js";

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

        if (!data) {
            return;
        }

        const auth = {
            token: data.accessToken || data.token, user: data.user
        };

        authManager.saveAuth(auth);
        window.location.href = "../views/menu.html";
    } catch (err) {
    }
}

async function trySilentLogin() {


    const token = authManager.getValidToken();
    if (!token) {
        return;
    }

    const storedUser = authManager.getUser();
    if (!storedUser || !storedUser.id) {
        console.warn("Kein User im Storage → Auth wird geleert");
        authManager.clearAuth();
        return;
    }

    const userId = storedUser.id;

     try {

        const response = await loginService.getById(userId);

        const user = response.user || response;

        authManager.saveAuth({
                                 token, user
                             });


        window.location.href = "../views/menu.html";
    } catch (err) {
        authManager.clearAuth();
    }
}