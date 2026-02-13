'use strict';

import { orderService } from "../services/orderService.js";
import { getCart, clearCart, getCartTotal } from "../utils/cartStorage.js";

import {formatDate, formatUserName} from "../utils/helpers.js";

let currentOrderId = null;

initPage();

function initPage() {
    document.addEventListener('DOMContentLoaded', async () => {


        const params = new URLSearchParams(window.location.search);
        currentOrderId = params.get("id");
        console.log (currentOrderId);


        if (! currentOrderId) {
            console.warn("Keine id in der URL");
           // window.location.href = "../views/menu.html";
            return;
        }

        await loadOrder(currentOrderId);



    });
}

async function loadOrder(orderId) {
    try {
        const order = await orderService.getById(orderId);
        console.log(order);

      if (!order) {
            console.log("Bestellung nicht gefunden.");
          //  window.location.href = "../views/menu.html";
            return;
        }




        setValue("vorname", order.firstname || "");
        setValue("nachname", order.lastname || "");

        setValue("telefon", order.phoneNumber || "");
        setValue("adresse", order.address || "");
        setValue("ort", order.city || "");
         setValue("anmerkung", order.deliveryNote || "");

         setText("createdAt", formatDate(order.deliveredAt));

        if (Array.isArray(order.items)) {
            renderOrderDetails (order)
        }

    } catch (err) {
        console.error("Fehler beim Laden:", err);
        //window.location.href = "../views/menu.html";
    }
}


function setValue(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value;
}


function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value ?? "";
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
        firstname,
        lastname,
        phoneNumber,
        address,
        zipcode,
        city,
        deliveryNote,
        total: getCartTotal(),
        items: cart.items.map(it => ({
            productId: String(it.productId),
            quantity: Number(it.quantity) || 1
        }))
    };
}



function formatEuro(value) {
    return '€' + value.toFixed(2).replace('.', ',');
}

function renderOrderDetails(order) {
    const tbody = $('#orderSummary');
    tbody.empty();


    if (!order.items.length) {
        tbody.append(`
          <tr>
            <td colspan="3" class="text-center text-muted">Keine Produkte in der Betsellung</td>
          </tr>
        `);
        return;
    }

    let total = 0;
    order.items.forEach(item => {
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