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
    });
}

function logoutOnRegisterPage() {
    if (someEndpoint(["register"])) {
        authManager.clearAuth();
    }
}

function navBarVisibility() {
    const isLoggedIn = authManager.isLoggedIn();
    const isAdmin = authManager.isAdmin();

    // Support-Inhalte ausblenden auf Login/Register
    if (someEndpoint(["register", "login"])) {
        $('#navTogglerSupportContent').hide();
    }

    // Login Button Steuerung
    if (someEndpoint(["register", "login"]) || isLoggedIn) {
        $('#navLogin').hide();
    } else {
        $('#navLogin').show();
    }

    // User-Spezifische Menüs
    if (isLoggedIn) {
        $('#navUserMenu').show();
        $('#navOrderList').show();

        // WICHTIG: Link zum eigenen Profil (ohne ID-Parameter für /me)
        $('#navMyProfile').attr('href', '../views/userdetails.html');

        const nbr = $('#navbar-right');
        nbr.removeClass("mt-3").addClass("mt-1");
    } else {
        $('#navUserMenu').hide();
        $('#navOrderList').hide();
        const nbr = $('#navbar-right');
        nbr.removeClass("mt-1").addClass("mt-3");
    }

    // Admin-Spezifische Menüs
    if (isLoggedIn && isAdmin) {
        $('#navUserList').show();
        $('#navProductList').show();
        // Falls auf Mobile: Toggler anzeigen
        if ($(window).width() < 768) {
            $('#navTogglerSupportContent').show();
        }
    } else {
        $('#navUserList').hide();
        $('#navProductList').hide();
    }

    // Back-Button Steuerung
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

    window.addEventListener('pageshow', function () {
        logoutOnRegisterPage();
        renderNavbar();
    });
}