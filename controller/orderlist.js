"use strict";

import {orderService} from "../services/orderService.js";
import {authManager} from "../services/authManager.js";
import {sortList} from "../utils/helpers.js";

let orders = [];
let currentSort = {key: "", asc: true};

$(async function () {

    const params = new URLSearchParams(window.location.search);
    const onlyOwn = params.get("onlyOwn");

    if (!onlyOwn) {
        if (!authManager.isLoggedIn() || !authManager.isAdmin()) {
            window.location.href = "../views/menu.html";
            return;
        }
    }
    await loadOrders(onlyOwn);
    registerUiEvents();
});

async function loadOrders(onlyOwn) {
    try {
        let data;
        if (onlyOwn === 'true') {
            data = await orderService.getMyOrders();

        } else {
            data = await orderService.getAll();
        }

        if (!data || !Array.isArray(data)) {
            throw new Error("Unerwartete Serverantwort (keine Orderliste)");
        }

        orders = data.map(o => ({
            ...o, username: (o.createdBy && o.createdBy.username) ? o.createdBy.username : "", email: (o.createdBy && o.createdBy.email) ? o.createdBy.email : ""
        }));
        renderOrders(orders);
    } catch (err) {
        alert("Fehler beim Laden der Bestellungen: " + (err.message || err));
        window.location.href = "../views/menu.html";
    }
}

function formatDate(instantString) {
    if (!instantString) return "";
    const d = new Date(instantString);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("de-AT");
}

function renderOrders(list) {
    const tbody = $("#table-body");
    const cards = $("#card-container");
    tbody.empty();
    cards.empty();

    list.forEach((o) => {
        const deliveredOrCreated = o.deliveredAt || o.createdAt;
        const date = formatDate(deliveredOrCreated);
        const total = o.total ?? 0;

        const firstname = o.firstname || "";
        const lastname = o.lastname || "";
        const zipcode = o.zipcode || "";
        const city = o.city || "";

               const username = o.username || "";
        const email = o.email || "";

        tbody.append(`
      <tr class="order-row" data-order-id="${o.orderId}">
        <td>${date}</td>
        <td>€ ${Number(total).toFixed(2)}</td>
        <td>${username}</td>
        <td>${firstname}</td>
        <td>${lastname}</td>
        <td>${email}</td>
        <td>${zipcode}</td>
      </tr>
    `);


        cards.append(`
      <div class="col-12 col-sm-6 col-md-4" data-order-id="${o.orderId}">
        <div class="card h-100 order-card">
          <div class="card-body p-2">
            <p class="mb-1">${date}</p>
            <p class="mb-1">€ ${Number(total).toFixed(2)}</p>
            <p class="mb-1">${firstname} ${lastname}</p>
            <p class="mb-1">${email}</p>
            <p class="mb-1">PLZ: ${zipcode}${city ? " - " + city : ""}</p>
          </div>
        </div>
      </div>
    `);
    });


    $(document)
        .off("click.orderNav")
        .on("click.orderNav", ".order-row, .order-card", function () {
            const id = $(this).data("orderId");
            if (!id) return;
            window.location.href = `../views/orderdetail.html?id=${encodeURIComponent(id)}`;
        });
}


function applyFilterAndSort() {
    const rawFilter = $("#filter-all").val() || "";
    const filter = rawFilter.toLowerCase();

    const filtered = orders.filter(u => {
        const values = Object.values(u);

        return values.some(val => {
            const text = String(val).toLowerCase();
            return text.includes(filter);
        });
    });

    const sorted = currentSort.key ? sortList(filtered, currentSort.key, currentSort.asc) : filtered;

    renderOrders(sorted);
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
