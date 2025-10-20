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
           window.location.href = "../views/menu.html"
        })
       .fail(api.handleError.bind(api));
    /* wäre ident
    .fail((xhr, textStatus, error) => api.handleError(xhr, textStatus, error));
     */
    }




$(function() {
      $('#footer').load('../views/footer.html');
    });


