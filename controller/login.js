import { api } from "../services/BaseApiService.js";
import {UserStorageService} from "../services/UserStorageService.js";
import {AuthStorageService} from "../services/AuthStorageService.js";


$(document).ready(function () {
    $('#loginForm').on('submit', function(e) {
        e.preventDefault();
        const $email = $('#email').val().trim();
        const $password = $('#password').val().trim();
        if($email && $password) {
            login ($email, $password);
        } else {
            alert('Bitte alle Felder ausfüllen.');
        }
    });
});


function login (email, password) {
    api.post("/auth/login", {username: email, password: password })
       .done(function (data) {
           UserStorageService.setUser(data);
           AuthStorageService.setToken(data.accessToken);
           console.log(UserStorageService.getUser());
           window.location.href = "../views/menu.html"
       }).fail(function(error) {
        console.log(error)
        if(error.status === 404) {
            alert("Resource nicht gefunden. Bitte melden Sie sich beim Adminsitrator: admin@technikum-wien.at");
            return;
        }
        if(error.status === 403) {
            alert("Email oder Passwort falsch.");
            return;
        }
        if (error.status >= 500) {
            alert("Interner Serverfehler. Bitte später erneut versuchen.");
            return;
        }
        alert("Allgemeiner Fehler beim Ladend er Daten.")

    })
    /* wäre möglich - beide Aufrufe sind ident
     .fail(api.handleError.bind(api));
    .fail((xhr, textStatus, error) => api.handleError(xhr, textStatus, error));
     */
    }




$(function() {
      $('#footer').load('../views/footer.html');
    });


