import {UserStorageService} from "../services/UserStorageService.js";
import {getMainEndpoint, getMainEndpointFromUrl, someEndpoint} from "../utils/checkEndpoints.js";
import {AuthStorageService} from "../services/AuthStorageService.js";

$(function () {
    renderNavbar();
});

function renderNavbar() {
    $('#navigation').load('../views/navigation.html', function () {
        navBarVisibility();
        registerEvents();
        //console.log(document.referrer || "Kein Referrer verfügbar");
    });
}


function navBarVisibility() {

    //no Support Menu on Register, Login
    if (someEndpoint(["register", "login"])) {
        UserStorageService.clearUser();
        $('#navTogglerSupportContent').hide();
    }


    //Login Button,
    if (someEndpoint(["register", "login"]) || UserStorageService.isLoggedIn()) {
        $('#navLogin').hide();
    } else {
        $('#navLogin').show();
    }
    //UserMenu , Orders
    if (UserStorageService.isLoggedIn()) {
        $('#navUserMenu').show();
        $('#navOrderList').show();
        const nbr = $('#navbar-right');
        nbr.removeClass("mt-3");
        nbr.addClass("mt-1");
    } else {
        $('#navUserMenu').hide();
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

  //navback document.referrer = history.back()
    // oder wenn der aktulle gleich dem vorigen ist
    if (getMainEndpointFromUrl(document.referrer) === "index" ||
        getMainEndpointFromUrl(document.referrer) === "login" ||
        getMainEndpointFromUrl(document.referrer) === getMainEndpoint()
    ) {
        $('#navBack').hide();
    } else {
        $('#navBack').show();;
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
    $("#navBack").on("click", function (e) {
        e.preventDefault();
        history.back();
    });
    //  (Back/Forward)
    window.addEventListener('pageshow', function (e) {
        renderNavbar();
    });
}