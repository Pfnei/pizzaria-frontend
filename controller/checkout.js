'use strict';

import {orderService} from "../services/orderService.js";
import {getCart, clearCart, getCartTotal} from "../utils/cartStorage.js";
import {userService} from "../services/userService.js";
import {authManager} from "../services/authManager.js";

let hasSubmittedForm = false;
let liveCheckFields = false;

initCheckout();

function initCheckout() {
    document.addEventListener('DOMContentLoaded', () => {
        const deliveryForm = document.getElementById('deliveryForm');
        const submitForm = document.getElementById('checkoutSubmitForm');

        changeEnterToTab(deliveryForm);
        submitForm.addEventListener('submit', handleFormSubmit);

        if (authManager.isLoggedIn()) {
            loadUserDetails();
        }


        renderOrderSummary();
        updateSubmitEnabledState();

    });
}

function updateSubmitEnabledState() {
    const cart = getCart();
    const btn = document.querySelector('#checkoutSubmitForm button[type="submit"]');
    if (!btn) return;

    btn.disabled = !cart.items.length;
    btn.title = cart.items.length ? "" : "Warenkorb ist leer.";
}

async function handleFormSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const isValid = validateForm();

    form.classList.add('was-validated');

    if (!hasSubmittedForm) {
        hasSubmittedForm = true;
        bindLiveValidation();

    }

    if (!isValid) return;

    const cart = getCart();
    if (!cart.items.length) {
        alert("Warenkorb ist leer. Bitte füge Produkte hinzu.");
        updateSubmitEnabledState();
        return;
    }

    const btn = document.querySelector('#checkoutSubmitForm button[type="submit"]');
    if (btn) btn.disabled = true;

    try {
        const dto = buildOrderCreateDto(cart);
        await orderService.create(dto);

        clearCart();
        showSuccessAndRedirect();
    } catch (err) {
        console.error("Order create failed:", err);
        alert(err?.message || "Bestellung fehlgeschlagen.");
        if (btn) btn.disabled = false;
    }
}

function buildOrderCreateDto(cart) {
    const firstname = (document.getElementById('vorname')?.value || "").trim();
    const lastname = (document.getElementById('nachname')?.value || "").trim();
    const phoneNumber = (document.getElementById('telefon')?.value || "").trim();
    const address = (document.getElementById('adresse')?.value || "").trim();
    const zipcode = (document.getElementById('plz')?.value || "").trim();
    const city = (document.getElementById('ort')?.value || "").trim();
    const deliveryNote = (document.getElementById('anmerkung')?.value || "").trim();

    return {
        firstname, lastname, phoneNumber, address, zipcode, city, deliveryNote, total: getCartTotal(), items: cart.items.map(it => ({
            productId: String(it.productId), quantity: Number(it.quantity) || 1
        }))
    };
}

function validateForm() {
    let isFormValid = true;
    isFormValid = validateStringInput('vorname', true, 2, 30) && isFormValid;
    isFormValid = validateStringInput('nachname', true, 3, 100) && isFormValid;
    isFormValid = validateStringInput('telefon', true, 7, 30) && isFormValid;
    isFormValid = validateStringInput('adresse', true, 7, 100) && isFormValid;
    isFormValid = validateStringInput('plz', true, 2, 10) && isFormValid;
    isFormValid = validateStringInput('ort', true, 1) && isFormValid;
    return isFormValid;
}

function bindLiveValidation() {
    if (liveCheckFields) return;
    liveCheckFields = true;

    const validators = {
        vorname: () => validateStringInput('vorname', false, 3, 30),
        nachname: () => validateStringInput('nachname', false, 2, 100),
        telefon: () => validateStringInput('telefon', false, 7, 30),
        adresse: () => validateStringInput('adresse', true, 7, 100),
        plz: () => validateStringInput('plz', true, 2, 10),
        ort: () => validateStringInput('ort', true, 1)
    };

    Object.keys(validators).forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;

        const handler = () => {
            if (!hasSubmittedForm) return;
            validators[id]();
        };

        el.addEventListener('input', handler);
        el.addEventListener('blur', handler);
    });
}

function showSuccessAndRedirect() {
    Swal.fire({
                  title: "Vielen Dank!", text: "Deine Bestellung wird zubereitet", icon: "success", timer: 2500, showConfirmButton: false
              });
    setTimeout(() => {window.location.href = "../views/menu.html"}, 3000);
}

function formatEuro(value) {
    return '€' + value.toFixed(2).replace('.', ',');
}

function renderOrderSummary() {
    const tbody = $('#orderSummary');
    tbody.empty();

    const cart = getCart();
    if (!cart.items.length) {
        tbody.append(`
          <tr>
            <td colspan="3" class="text-center text-muted">Warenkorb ist leer</td>
          </tr>
        `);
        return;
    }

    let total = 0;
    cart.items.forEach(item => {
        const qty = Number(item.quantity) || 0;
        const price = Number(item.price) || 0;
        const itemTotal = qty * price;
        total += itemTotal;

        const row = `
          <tr>
            <td>${item.productName ?? item.productId}</td>
            <td class="text-center">${qty}</td>
            <td class="text-end">${formatEuro(itemTotal)}</td>
          </tr>
        `;
        tbody.append(row);
    });

    const totalRow = `
      <tr>
        <th colspan="2">Gesamt (EURO)</th>
        <th class="text-end">${formatEuro(total)}</th>
      </tr>
    `;
    tbody.append(totalRow);
}


async function loadUserDetails() {
    try {
        let user;
        user = await userService.getMe();

        if (!user) throw new Error("Benutzer nicht gefunden.");

        // Formular befüllen
        setValue("vorname", user.firstname || "");
        setValue("nachname", user.lastname || "");
        setValue("telefon", user.phoneNumber || "");
        setValue("adresse", user.address || "");
        setValue("plz", user.zipcode || "");
        setValue("ort", user.city || "");


    } catch (err) {
        console.error("Fehler beim Laden0:", err);

    }
}

function setValue(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value;
}

