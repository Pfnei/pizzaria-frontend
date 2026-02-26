"use strict";

import {orderService} from "../services/orderService.js";
import {addToCart} from "../utils/cartStorage.js";

import {formatDate} from "../utils/helpers.js";

let currentOrderId = null;
let currentOrder = null;

initPage();

function initPage() {
    document.addEventListener('DOMContentLoaded', async () => {

        const params = new URLSearchParams(window.location.search);
        currentOrderId = params.get("id");

        if (!currentOrderId) {
            console.warn("Keine id in der URL");
            return;
        }

        await loadOrder(currentOrderId);

        const addToCart = document.getElementById('addToCart');

        addToCart?.addEventListener('click', () => addOrderItemsToCart());

    });
}

async function loadOrder(orderId) {
    try {
        const order = await orderService.getById(orderId);
        currentOrder = order;

        if (!order) {
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
            renderOrderDetails(order)
        }

    } catch (err) {
    }
}


function addOrderItemsToCart() {
    if (!currentOrder || !Array.isArray(currentOrder.items) || currentOrder.items.length === 0) return;


    currentOrder.items.forEach((item) => {
        const productId = item.product.productId
        if (!productId) return;

        const qty = item.quantity || 0;

        addToCart({
                      productId: String(productId), productName: item.product.productName, price: Number(item.product.price ?? 0), vegetarian: Boolean(item.product.vegetarian),
                  }, qty);
    });

    alert("Produkte wurden in den Warenkorb übernommen");
}


function setValue(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value;
}


function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value ?? "";
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
        const itemTotal = price;
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