'use strict';

import {authManager} from "../services/authManager.js";
import {getCart, updateQuantity, removeFromCart, getCartTotal} from "../utils/cartStorage.js";

document.addEventListener("DOMContentLoaded", () => {
    const btnCheckout = document.getElementById("btnCheckout");
    const btnGuest = document.getElementById("btnGuest");
    const btnLoginOrRegister = document.getElementById("btnLoginOrRegister");
    const modalEl = document.getElementById("checkOutModal");

    console.log("shoppingcarts.js loaded", {
        btnCheckoutFound: !!btnCheckout, modalFound: !!modalEl, isLoggedIn: authManager.isLoggedIn(), validTokenPresent: !!authManager.getValidToken(), href: window.location.href
    });

    document.addEventListener("click", (e) => {
        const t = e.target;
        const id = t?.id ? `#${t.id}` : "";
        const cls = t?.className ? `.${String(t.className).trim().replaceAll(" ", ".")}` : "";
        console.log("document click:", `${t?.tagName || "?"}${id}${cls}`);
    }, true);

    if (btnCheckout) {


        btnCheckout.addEventListener("click", () => {

            if (authManager.isLoggedIn()) {
                const target = "./checkout.html";
                window.location.assign(target);
                return;
            }

            if (modalEl && window.bootstrap?.Modal) {

                const modal = window.bootstrap.Modal.getOrCreateInstance(modalEl);
                modal.show();
            } else {
                        window.location.assign("./login.html");
            }
        });
    }

    if (btnGuest) {
        btnGuest.addEventListener("click", () => window.location.assign("./checkout.html"));
    }

    if (btnLoginOrRegister) {
        btnLoginOrRegister.addEventListener("click", () => window.location.assign("./login.html"));
    }

    const cartItemsEl = document.getElementById("cartItems");
    if (cartItemsEl) {
        cartItemsEl.addEventListener("click", (e) => {
            const btn = e.target.closest("button[data-action]");
            if (!btn) return;

            const action = btn.getAttribute("data-action");
            const productId = btn.getAttribute("data-product-id");
            if (!productId) return;

            const cart = getCart();
            const item = cart.items.find((x) => String(x.productId) === String(productId));
            const currentQty = Number(item?.quantity) || 0;

            if (action === "inc") updateQuantity(productId, currentQty + 1);
            if (action === "dec") updateQuantity(productId, currentQty - 1);
            if (action === "remove") removeFromCart(productId);

            renderCart();
        });
    }

    renderCart();
});

function renderCart() {
    const cart = getCart();
    const cartItemsEl = document.getElementById("cartItems");
    const totalEl = document.getElementById("totalPrice");
    if (!cartItemsEl || !totalEl) return;

    if (!cart.items.length) {
        cartItemsEl.innerHTML = `<div class="p-3 text-center text-muted">Dein Warenkorb ist leer.</div>`;
        totalEl.textContent = formatEuro(0);
        return;
    }

    cartItemsEl.innerHTML = cart.items.map(renderItemRow).join("");
    totalEl.textContent = formatEuro(getCartTotal());
}

function renderItemRow(item) {
    const name = escapeHtml(item.productName ?? item.productId);
    const vegetarian = item.vegetarian ? ` <i class="bi bi-leaf-fill text-success"></i>` : "";
    const qty = Number(item.quantity) || 1;
    const price = Number(item.price) || 0;
    const itemTotal = price * qty;

    return `
    <div class="d-flex border-bottom mb-2 pt-2 pb-3 px-0 justify-content-between align-items-center flex-wrap">
      <div class="d-flex fw-bold col-12 mb-1 col-sm-6 mb-sm-0 fs-6 justify-content-between">
        <div>${name}${vegetarian}</div>
        <div class="d-sm-none fw-bold fs-6 text-end item-price ms-2">${formatEuro(itemTotal)}</div>
      </div>

      <div class="d-flex col-12 mt-2 col-sm-6 mt-sm-0 align-items-center justify-content-end ms-auto rounded-pill gap-1 bg-light">
        <div class="d-flex align-items-stretch px-1 py-0 me-2 rounded-pill">
          <button class="btn p-0 border-0 bg-transparent"
                  data-action="remove"
                  data-product-id="${escapeHtmlAttr(item.productId)}"
                  aria-label="Löschen">
            <i class="bi bi-trash"></i>
          </button>
        </div>

        <div class="d-flex align-items-center px-2 py-0 rounded-pill">
          <button class="btn p-0 border-0 bg-transparent"
                  data-action="dec"
                  data-product-id="${escapeHtmlAttr(item.productId)}"
                  aria-label="Minus">
            <i class="bi bi-dash"></i>
          </button>
          <span class="fw-bold px-1 fs-6">${qty}</span>
          <button class="btn p-0 border-0 bg-transparent"
                  data-action="inc"
                  data-product-id="${escapeHtmlAttr(item.productId)}"
                  aria-label="Plus">
            <i class="bi bi-plus"></i>
          </button>
        </div>

        <div class="d-none d-sm-block fw-bold fs-6 text-end item-price ms-2">${formatEuro(itemTotal)}</div>
      </div>
    </div>
  `;
}

function formatEuro(value) {
    const v = Number(value) || 0;
    return "€ " + v.toFixed(2).replace(".", ",");
}

function escapeHtml(str) {
    return String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function escapeHtmlAttr(str) {
    return escapeHtml(str).replaceAll("\n", " ").replaceAll("\r", " ");
}