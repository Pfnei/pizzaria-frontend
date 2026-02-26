"use strict";

import {productService} from "../services/productService.js";
import {authManager} from "../services/authManager.js";
import {sortList} from "../utils/helpers.js";


let products = [];
let currentSort = {key: "", asc: true};

$(async function () {

    if (!authManager.isLoggedIn() || !authManager.isAdmin()) {
        window.location.href = "../views/menu.html";
        return;
    }

    await loadProducts();

    enableAddingProductsUi();
    registerUiEvents();
});

async function loadProducts() {
    try {
        const data = await productService.getAll();

        if (!data || !Array.isArray(data)) {
            throw new Error("Unerwartete Serverantwort (keine Produktliste)");
        }

        products = data;
        renderProducts(products);
    } catch (err) {
        alert("Fehler beim Laden der Produkte: " + (err.message || err));
        window.location.href = "../views/menu.html";
    }
}

function renderProducts(list) {
    const tbody = $("#table-body");
    const cards = $("#card-container");
    tbody.empty();
    cards.empty();

    if (!list || list.length === 0) {
        return;
    }

    list.forEach(p => {
        const name = p.productName || "";
        const mainCategory = p.mainCategory || "";
        const price = p.price ?? 0;
        const active = !!p.active;
        const vegetarian = !!p.vegetarian;

        const statusBadge = `
      <span class="badge ${active ? "bg-success" : "bg-secondary"}">
        ${active ? "aktiv" : "inaktiv"}
      </span>
    `.trim();

        const vegBadge = vegetarian ? `<span class="badge bg-success ms-1">vegi</span>` : "";

        tbody.append(`
      <tr class="product-row" data-product-id="${p.productId}">
        <td>${name}</td>
        <td>${categoryLabel(mainCategory)}</td>
        <td>€ ${Number(price).toFixed(2)}</td>
        <td class="text-center">${vegBadge}</td>
        <td class="text-center">${statusBadge}</td>
      </tr>
    `);

        cards.append(`
      <div class="col-12 col-sm-6 col-md-4" data-product-id="${p.productId}" >
        <div class="card h-100 product-card">
          <div class="card-body p-2">
            <p class="mb-1 fw-semibold">${name}</p>
            <p class="mb-1">€ ${Number(price).toFixed(2)}</p>
            <p class="mb-0">${statusBadge} ${vegBadge}</p>
          </div>
        </div>
      </div>
    `);
    });

    $(document)
        .off("click.productNav")
        .on("click.productNav", ".product-row, .product-card", function () {
            const id = $(this).data("productId");
            if (!id) return;
            let url;
            if (authManager.isAdmin()) {
                url = `../views/productdetailadmin.html?id=${encodeURIComponent(id)}`;
            } else {
                url = `../views/productdetail.html?id=${encodeURIComponent(id)}`;
            }
            window.location.href = url;
        });
}

function categoryLabel(mainCategory) {
    switch (String(mainCategory)) {
        case "STARTER":
            return "Vorspeise";
        case "MAIN_COURSE":
            return "Hauptspeise";
        case "DESSERT":
            return "Nachspeise";
        case "DRINK":
            return "Getränk";
        default:
            return String(mainCategory);
    }
}

function applyFilterAndSort() {
    const rawFilter = $("#filter-all").val() || "";
    const filter = rawFilter.toLowerCase();

    const filtered = products.filter(u => {
        const values = Object.values(u);

        return values.some(val => {
            const text = String(val).toLowerCase();
            return text.includes(filter);
        });
    });

    const sorted = currentSort.key ? sortList(filtered, currentSort.key, currentSort.asc) : filtered;

    renderProducts(sorted);
}

function enableAddingProductsUi() {
    if (!$("#addingProductAdmin")) return;
    const addButton = $("#addingProductAdmin");
    if (authManager.isLoggedIn() && authManager.isAdmin()) {
        addButton.show();
        addButton.on("click", function () {
            window.location.href = "../views/productdetailnew.html";
        });
    } else {
        addButton.hide();
    }
    $("#addingProductAdmin").prop("disabled", false);

}


function registerUiEvents() {
    $("#filter-all").on("input", applyFilterAndSort);

    $("#sort-dropdown").on("change", function () {
        currentSort.key = $(this).val();
        currentSort.asc = true;
        applyFilterAndSort();
    });

    $(document).on("click", "th.sortable", function () {
        const key = $(this).data("key");
        if (currentSort.key === key) {
            currentSort.asc = !currentSort.asc;
        } else {
            currentSort = {key, asc: true};
        }
        applyFilterAndSort();
    });

}