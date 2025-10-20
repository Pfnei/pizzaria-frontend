import {UserStorageService} from "../services/UserStorageService.js";
import {getMainEndpoint, someEndpoint} from "../utils/checkEndpoints.js";
import {AuthStorageService} from "../services/AuthStorageService.js";

$(function () {
    $('#navigation').load('../views/navigation.html', function () {
        navBarVisibility();
        registerEvents();
    });
});

function navBarVisibility() {
    //Login Button,
    if (someEndpoint(["register", "login"]) || UserStorageService.isLoggedIn()) {
        $('#navLogin').hide();
    } else {
        $('#navLogin').show();
    }
    //UserMenu
    if (UserStorageService.isLoggedIn()) {
        $('#userMenu').show();
        const nbr = $('#navbar-right');
        nbr.removeClass("mt-3");
        nbr.addClass("mt-1");
    } else {
        $('#userMenu').hide();
        const nbr = $('#navbar-right');
        nbr.removeClass("mt-1");
        nbr.addClass("mt-3");
    }

    //Finetuning Shoppingcart
    if (someEndpoint(["register", "login"])) {
         const sc = $('#shoppingCart');
        sc.addClass("me-4");
    } else {
        const sc = $('#shoppingCart');
        sc.removeClass("me-4");
    }



}

// Logout
function registerEvents() {
    $("#logoutLink").on("click", function (e) {
        e.preventDefault();
        try {
            AuthStorageService.clearToken();
            UserStorageService.clearUser();
        } catch {}
        window.location.href = this.href;
    });
}