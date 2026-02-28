"use strict";

import {authManager} from "../services/authManager.js";
import {getMainEndpoint, getMainEndpointFromUrl, someEndpoint} from "../utils/checkEndpoints.js";

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

    if (someEndpoint(["register", "login"])) {
        $('#navTogglerSupportContent').hide();
    }

    if (someEndpoint(["register", "login"]) || isLoggedIn) {
        $('#navLogin').hide();
    } else {
        $('#navLogin').show();
    }


    if (isLoggedIn) {
        $('#navUserMenu').show();
        $('#navMyProfile').attr('href', '../views/userdetail.html');
        const nbr = $('#navbar-right');
        nbr.removeClass("mt-3").addClass("mt-1");
    } else {
        $('#navUserMenu').hide();

        const nbr = $('#navbar-right');
        nbr.removeClass("mt-1").addClass("mt-3");
    }

    if (isLoggedIn && isAdmin) {
        $('#navUserList').show();
        $('#navProductList').show();
        $('#navOrderList').show();
        if ($(window).width() < 768) {
            $('#navTogglerSupportContent').show();
        }
    } else {
        $('#navUserList').hide();
        $('#navProductList').hide();
        $('#navOrderList').hide();
        $('#navTogglerSupportContent').hide();
    }

    if (getMainEndpointFromUrl(document.referrer) === "index" || getMainEndpointFromUrl(document.referrer) === "login" || getMainEndpointFromUrl(document.referrer) === getMainEndpoint()) {
        $('#navBack').hide();
    } else {
        $('#navBack').show();
    }
}

function registerEvents() {
    $("#logoutLink").on("click", function (e) {
        e.preventDefault();
        console.log("outpath")
        setTimeout(1000);
        try {
            authManager.clearAuth();
            console.log("out")
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
    $("#navLogin").on("click", function (e) {
        const isLoggedIn = authManager.isLoggedIn();
        if (!isLoggedIn) {
            e.preventDefault();
            window.location.href = "../views/login.html";
        }
    });
}