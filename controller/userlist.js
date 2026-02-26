'use strict';


import {userService} from "../services/userService.js";
import {authManager} from "../services/authManager.js";
import {sortList} from "../utils/helpers.js";

let users = [];
let currentSort = {key: "", asc: true};


$(async function () {


    if (!authManager.isLoggedIn() || !authManager.isAdmin()) {
        window.location.href = "../views/menu.html";
        return;
    }
    await loadUsers();
    registerUiEvents();
});

async function loadUsers() {
    try {
        const data = await userService.getAll();

        if (!data || !Array.isArray(data)) {
            throw new Error("Unerwartete Serverantwort (keine Userliste)");
        }

        users = data;
        renderUsers(users);
    } catch (err) {
        alert("Fehler beim Laden der User: " + err.message);
        window.location.href = "../views/menu.html";
    }
}

function renderUsers(list) {
    const tbody = $("#table-body");
    const cards = $("#card-container");
    tbody.empty();
    cards.empty();


    list.forEach(user => {
        const statusBadge = `
      <span class="badge ${user.active ? "bg-success" : "bg-secondary"}">
        ${user.active ? "Aktiv" : "Inaktiv"}
      </span>`.trim();

        const adminBadge = `
      <span class="badge ${user.admin ? "bg-primary" : "bg-secondary"}">
        ${user.admin ? "Admin" : "Benutzer"}
      </span>`.trim();

        tbody.append(`
      <tr class="user-row" data-user-id="${user.userId}">
        <td>${user.username}</td>
        <td>${user.firstname}</td>
        <td>${user.lastname}</td>
        <td>${user.email}</td>
        <td class="text-center">${user.zipcode}</td>
        <td class="text-center">${statusBadge}</td>
        <td class="text-center">${adminBadge}</td>
      </tr>
    `);

        cards.append(`
      <div class="col-12 col-sm-6 col-md-4">
        <div class="card h-100 user-card" data-user-id="${user.userId}">
          <div class="card-body p-2">
            <p class="mb-1 fw-semibold">${user.username}</p>
            <p class="mb-1">${user.firstname} ${user.lastname}</p>
            <p class="mb-1">${user.email}</p>
            <p class="mb-1">PLZ: ${user.zipcode}</p>
            <p class="mb-0 d-flex gap-2">${statusBadge} ${adminBadge}</p>
          </div>
        </div>
      </div>
    `);
    });


    $(document)
        .off("click.userNav")
        .on("click.userNav", ".user-row, .user-card", function () {
            const id = $(this).data("userId");
            if (!id) return;
            const url = `../views/userdetail.html?id=${encodeURIComponent(id)}`;
            window.location.href = url;
        });
}


function applyFilterAndSort() {
    const rawFilter = $("#filter-all").val() || "";
    const filter = rawFilter.toLowerCase();

    const filtered = users.filter(u => {
        const values = Object.values(u);

        return values.some(val => {
            const text = String(val).toLowerCase();
            return text.includes(filter);
        });
    });

    const sorted = currentSort.key ? sortList(filtered, currentSort.key, currentSort.asc) : filtered;

    renderUsers(sorted);
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
