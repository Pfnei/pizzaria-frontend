'use strict';

import {userService} from "../services/userService.js";
import {authManager} from "../services/authManager.js";
import {fileService} from "../services/fileService.js";
import {orderService} from "../services/orderService.js";
import {productService} from "../services/productService.js";


let hasSubmittedForm = false;
let liveCheckFields = false;
let currentUserId = null;
let isOwnUser = false;
let oldUser;

const deleteBtn = document.getElementById('deleteUserBtn');

const form = document.getElementById('userForm');

initPage();

function initPage() {
    document.addEventListener('DOMContentLoaded', async () => {
        if (!authManager.isLoggedIn()) {
            window.location.href = "../views/login.html";
            return;
        }

        const params = new URLSearchParams(window.location.search);
        currentUserId = params.get("id");

        // USER LADEN (ID oder /me)
        await loadUser(currentUserId);

        isOwnUser = (authManager.getUserId() === currentUserId);

        if (!authManager.isAdmin() || isOwnUser) {
            const adminSection = document.getElementById('adminSection');
            if (adminSection) adminSection.style.display = 'none';

        }

        setupDiversDetails();

        const profileImage = document.getElementById('profileImage');
        const profileUploadInput = document.getElementById('profileUploadInput');

        profileImage?.addEventListener('click', () => profileUploadInput?.click());

        profileUploadInput?.addEventListener('change', async (event) => {
            const file = event.target.files[0];
            if (!file || !currentUserId) return;

            try {
                await fileService.uploadProfilePicture(currentUserId, file);
                if (profileImage.src.startsWith('blob:')) {
                    URL.revokeObjectURL(profileImage.src);
                }
                profileImage.src = URL.createObjectURL(file);
            } catch (err) {
            }
        });


        if (authManager.isAdmin() && !isOwnUser) {
            deleteBtn.style.display = 'block';
            deleteBtn.onclick = async () => {
                const result = await Swal.fire({
                                                   title: 'Möchtest du den Benutzer wirklich löschen?',
                                                   text: 'Dieser Vorgang kann nicht rückgängig gemacht werden!',
                                                   icon: 'warning',
                                                   showCancelButton: true,
                                                   confirmButtonText: 'Ja, löschen',
                                                   cancelButtonText: 'Abbrechen',
                                                   confirmButtonColor: '#dc3545'
                                               });

                if (result.isConfirmed) {
                    await deleteUser();
                }
            };


        }
        changeEnterToTab(form);
        form.addEventListener('submit', handleFormSubmit);
    });
}

async function loadUser(userId) {
    try {
        let user;
        if (userId) {
            user = await userService.getById(userId);
        } else {
            user = await userService.getMe();
            currentUserId = user.userId;
        }
        oldUser = user;

        if (!user) throw new Error("Benutzer nicht gefunden.");

        try {
            const blob = await fileService.downloadProfilePicture(user.userId);
            document.getElementById("profileImage").src = URL.createObjectURL(blob);
        } catch (e) {
        }

        setValue("anrede", user.salutation || "");
        setValue("diversDetails", user.salutationDetail || "");
        setValue("username", user.username || "");
        setValue("vorname", user.firstname || "");
        setValue("nachname", user.lastname || "");
        setValue("email", user.email || "");
        setValue("telefon", user.phoneNumber || "");
        setValue("adresse", user.address || "");
        setValue("plz", user.zipcode || "");
        setValue("ort", user.city || "");
        setValue("land", user.country || "");

        const activeEl = document.getElementById("active");
        if (activeEl) activeEl.checked = !!user.active;

        const adminEl = document.getElementById("admin");
        if (adminEl) adminEl.checked = !!user.admin;

        if (user.salutation === "MX") {
            const grp = document.getElementById('diversDetailsGroup');
            if (grp) grp.style.display = "block";
        }

    } catch (err) {
        window.location.href = "../views/menu.html";
    }
}

async function saveUser() {
    if (!currentUserId) return;

    const isAdmin = authManager.isAdmin();
    const payload = {
        username: getVal("username"),
        firstname: getVal("vorname"),
        lastname: getVal("nachname"),
        email: getVal("email"),
        phoneNumber: getVal("telefon"),
        address: getVal("adresse"),
        city: getVal("ort"),
        zipcode: getVal("plz") || null,
        salutation: getVal("anrede") || null,
        salutationDetail: getVal("diversDetails") || null,
        country: getVal("land") || null,
        password: getVal("passwort") || null,


        admin: (isAdmin && !isOwnUser) ? document.getElementById("admin")?.checked : null,
        active: (isAdmin && !isOwnUser) ? document.getElementById("active")?.checked : null
    };

    try {
        await userService.update(currentUserId, payload);
        const msgDiv = document.getElementById('successMessage');
        if (msgDiv) {
            msgDiv.textContent = 'Benutzer erfolgreich upgedated!';
            msgDiv.className = 'alert alert-success mt-3';
        }

        // werden die Claims im Token verändert, ist ein neuer Login erforderlich
        if (isOwnUser) {

            if (oldUser.email !== payload.email || oldUser.username !== payload.username) {
                authManager.clearAuth();

                setTimeout(() => {

                    window.location.href = "../views/login.html";
                }, 1000);
            }

        }

        setTimeout(() => {
            window.location.href = authManager.isAdmin() ? "../views/userlist.html" : "../views/menu.html";
        }, 2500);


    } catch (err) {
        const msgDiv = document.getElementById('successMessage');
        if (msgDiv) {
            msgDiv.textContent = 'Fehler beim Updaten des Benutzers! ';
            msgDiv.className = 'alert alert-danger mt-3';
            msgDiv.style = 'block';
            setTimeout(() => {
                msgDiv.textContent = ''
                msgDiv.className = '';
                msgDiv.style = 'none';
            }, 2000);

        } else {
            alert('Fehler beim Updaten des Benutzers!', err);
        }
    }
}


async function deleteUser() {

    if (!currentUserId) {
        console.log("Keine User-ID vorhanden.");
        return;
    }

    try {

        let canBeDeleted = true;
        const orders = await orderService.getAll({params: {createdBy: currentUserId}});
        const products = await productService.getAll({params: {createdBy: currentUserId}});

        if (orders.length > 0) {
            canBeDeleted = false;
        }

        if (products.length > 0) {
            canBeDeleted = false;
        }

        if (!canBeDeleted) {
            const result = await userService.update(currentUserId, {
                active: false
            });

            const msgDiv = document.getElementById('successMessage');
            if (msgDiv) {
                msgDiv.textContent = 'User hat Bestellungen oder Produkt angelegt - kann nicht gelöscht werden. User wurde INAKTIV gesetzt!';
                msgDiv.className = 'alert alert-warning mt-3';
            }

            setTimeout(() => {
                window.location.href = "userlist.html";
            }, 5000);
        } else {
            const result = await userService.delete(currentUserId);

            const msgDiv = document.getElementById('successMessage');
            if (msgDiv) {
                msgDiv.textContent = 'User erfolgreich gelöscht!';
                msgDiv.className = 'alert alert-success mt-3';
            }

            setTimeout(() => {
                window.location.href = "userlist.html";
            }, 2000);

        }


    } catch (error) {
        const msgDiv = document.getElementById('productMessage');
        if (msgDiv) {
            msgDiv.textContent = 'Fehler beim Löschen Users!';
            msgDiv.className = 'alert alert-danger mt-3';
        } else {
            alert('Fehler beim Löschen des Users!');
        }
    }
}


function setValue(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value;
}

function getVal(id) {
    const el = document.getElementById(id);
    return el ? el.value : "";
}

function handleFormSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const isValid = validateForm();

    form.classList.add('was-validated');

    if (!hasSubmittedForm) {
        hasSubmittedForm = true;
        bindLiveValidation();
    }

    if (isValid) saveUser();

}

function setupDiversDetails() {
    const anrede = document.getElementById('anrede');
    const detailsGroup = document.getElementById('diversDetailsGroup');
    if (!anrede || !detailsGroup) return;

    const toggle = () => {
        detailsGroup.style.display = (anrede.value === 'MX') ? 'block' : 'none';
    };
    anrede.addEventListener('change', toggle);
    toggle();
}

function validateForm() {
    let isFormValid = true;

    isFormValid = validateStringInput('vorname', false, 3, 30) && isFormValid;
    isFormValid = validateStringInput('nachname', false, 2, 100) && isFormValid;
    isFormValid = validateStringInput('username', true, 5, 30) && isFormValid;
    isFormValid = validateStringInput('email', true, 5, 100, false, false, false, true) && isFormValid;
    isFormValid = validateStringInput('telefon', false, 7, 30) && isFormValid;
    isFormValid = validateStringInput('plz', false, 2, 10) && isFormValid;
    isFormValid = validateStringInput('passwort', false, 8, 100, true, true, true) && isFormValid;
    isFormValid = validateStringInput('passwortWdh', false, 2, 100, true, true, true) && isFormValid;

    isFormValid = checkPasswordEquality('passwort', 'passwortWdh') && isFormValid;


    const detailsGroup = document.getElementById('diversDetailsGroup');
    if (detailsGroup && detailsGroup.style.display !== 'none') {
        isFormValid = validateStringInput('diversDetails', false, 4, 30) && isFormValid;
    } else {
        const details = document.getElementById('diversDetails');
        if (details && typeof clearValidation === "function") {
            clearValidation(details);
        }
    }
    return isFormValid;
}


function bindLiveValidation() {
    if (liveCheckFields) return;
    liveCheckFields = true;

    if (typeof validateStringInput !== "function") return;

    const validators = {
        vorname: () => validateStringInput('vorname', false, 3, 30),
        nachname: () => validateStringInput('nachname', false, 2, 100),
        username: () => validateStringInput('username', true, 5, 30),
        email: () => validateStringInput('email', true, 5, 100, false, false, false, true),
        telefon: () => validateStringInput('telefon', false, 7, 30),
        plz: () => validateStringInput('plz', false, 2, 10),
        passwort: () => {
            const a = validateStringInput('passwort', false, 8, 100, true, true, true, false);
            // beim Tippen im Passwort auch Gleichheit neu prüfen
            const b = checkPasswordEquality('passwort', 'passwortWdh');
            return a && b;
        },
        passwortWdh: () => checkPasswordEquality('passwort', 'passwortWdh'),
        diversDetails: () => {
            const grp = document.getElementById('diversDetailsGroup');
            if (grp && grp.style.display !== 'none') {
                return validateStringInput('diversDetails', false, 4, 30);
            } else {
                const details = document.getElementById('diversDetails');
                if (details && typeof clearValidation === "function") {
                    clearValidation(details);
                }
                return true;
            }
        }
    };

    Object.keys(validators).forEach((fieldId) => {
        const element = document.getElementById(fieldId);
        if (!element) return;

        const handler = () => {
            if (!hasSubmittedForm) return;
            validators[fieldId]();
        };

        if (element.tagName === 'SELECT') {
            element.addEventListener('change', handler);
        } else {
            element.addEventListener('input', handler);
            element.addEventListener('blur', handler);
        }
    });
}

