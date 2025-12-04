import { authManager } from "../services/authManager.js";
import { getMainEndpoint, getMainEndpointFromUrl, someEndpoint } from "../utils/checkEndpoints.js";

$(function () {
    logoutOnRegisterPage();
    renderNavbar();
});

function renderNavbar() {
    $('#navigation').load('../views/navigation.html', function () {
        navBarVisibility();
        registerEvents();
        // console.log(document.referrer || "Kein Referrer verfügbar");
    });
}

// no automatic Logout on Login Page because silent Login is tried
function logoutOnRegisterPage() {
    if (someEndpoint(["register"])) {
        authManager.clearAuth();
    }
}

function navBarVisibility() {

    // no Support Menu on Register, Login
    if (someEndpoint(["register", "login"])) {
        $('#navTogglerSupportContent').hide();
    }

    const isLoggedIn = authManager.isLoggedIn();
    const isAdmin = authManager.isAdmin();

    // Login Button
    if (someEndpoint(["register", "login"]) || isLoggedIn) {
        $('#navLogin').hide();
    } else {
        $('#navLogin').show();
    }

    // UserMenu , Orders
    if (isLoggedIn) {
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

    // Finetuning Shoppingcart
    if (someEndpoint(["register", "login"])) {
        const sc = $('#navShoppingCart');
        sc.addClass("me-4");
    } else {
        const sc = $('#navShoppingCart');
        sc.removeClass("me-4");
    }

    // AdminTools
    if (isLoggedIn && isAdmin) {
        $('#navUserList').show();
        $('#navProductList').show();
        $('#navOrderList').show();
    } else {
        $('#navUserList').hide();
        $('#navProductList').hide();
        $('#navOrderList').hide();
    }

    // navBack document.referrer = history.back()
    if (
        getMainEndpointFromUrl(document.referrer) === "index" ||
        getMainEndpointFromUrl(document.referrer) === "login" ||
        getMainEndpointFromUrl(document.referrer) === getMainEndpoint()
    ) {
        $('#navBack').hide();
    } else {
        $('#navBack').show();
    }
}

// Logout
function registerEvents() {
    $("#logoutLink").on("click", function (e) {
        e.preventDefault();
        try {
            authManager.clearAuth();
        } catch {}
        window.location.href = this.href;
    });

    $("#navBack").on("click", function (e) {
        e.preventDefault();
        history.back();
    });

    // (Back/Forward) - necessary when page is accessed via (Back/Forward)
    window.addEventListener('pageshow', function () {
        logoutOnRegisterPage();
        renderNavbar();
    });
}
