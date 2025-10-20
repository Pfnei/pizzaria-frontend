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
        console.log(UserStorageService.getUser())
        console.log(UserStorageService.isAdmin())
    } else {
        $('#navLogin').show();
    }
    //UserMenu , Orders
    if (UserStorageService.isLoggedIn()) {
        $('#userMenu').show();
        $('#navOrderList').show();
        const nbr = $('#navbar-right');
        nbr.removeClass("mt-3");
        nbr.addClass("mt-1");
    } else {
        $('#userMenu').hide();
        $('#navOrderList').hide();
        const nbr = $('#navbar-right');
        nbr.removeClass("mt-1");
        nbr.addClass("mt-3");
    }
    //Finetuning Shoppingcart
    if (someEndpoint(["register", "login"])) {
        const sc = $('#navShoppingCart');
        sc.addClass("me-4");
    } else {
        const sc = $('#navShoppingCart');
        sc.removeClass("me-4");
    }

    //no Support Menu on Register, Login
    if (someEndpoint(["register", "login"])) {
        $('#navTogglerSupportContent').hide();
   }


    //AdminTools
    if (UserStorageService.isLoggedIn() && UserStorageService.isAdmin()) {
        $('#navUserList').show();
        $('#navProductList').show();
        $('#navOrderList').show();
    } else {
        $('#navUserList').hide();
        $('#navProductList').hide();
        $('#navOrderList').hide();
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