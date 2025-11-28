import {api} from "../services/BaseApiService.js";
import {UserStorageService} from "../services/UserStorageService.js";

console.log(UserStorageService.isAdmin());
console.log(UserStorageService.getUser());
// maybe faster rerouting
if (!UserStorageService.isAdmin()) {window.location.href = "../views/menu.html"}


let usersFromAPI

function getUsers() {
    if (UserStorageService.isAdmin()) {
        api.get("/users")
           .done(function (orders) {
               usersFromAPI = orders;
               console.log(usersFromAPI);
               renderUsers(usersFromAPI);
           }).fail(api.handleError.bind(api));
    } else {
        window.location.href = "../views/menu.html"
    }
}


getUsers();


let users = [];
let currentSort = { key: "", asc: true };



function renderUsers(list) {
    const tbody = $("#table-body");
    const cards = $("#card-container");
    tbody.empty();
    cards.empty();

    list.forEach(user => {
        const statusBadge = `<span class="badge ${user.active ? "bg-success" : "bg-secondary"} toggle-status" data-username="${user.username}">${user.active ? "Aktiv" : "Inaktiv"}</span>`;
        const adminBadge = `<span class="badge ${user.admin ? "bg-success" : "bg-secondary"} toggle-admin" data-username="${user.username}">${user.admin ? "Ja" : "Nein"}</span>`;

        // Tabelle
        tbody.append(`
                <tr>
                    <td>${user.username}</td>
                    <td>${user.firstname}</td>
                    <td>${user.lastname}</td>
                    <td>${user.email}</td>
                    <td class="text-center">${user.zipcode}</td>
                    <td class="text-center">${statusBadge}</td>
                    <td class="text-center">${adminBadge}</td>
                </tr>
            `);

        // Cards
        cards.append(`
                <div class="col-12 col-sm-6 col-md-4">
                    <div class="card h-100">
                        <div class="card-body p-2">
                            <p class="mb-1">${user.username}</p>
                            <p class="mb-1">${user.firstname} ${user.surname}</p>
                            <p class="mb-1">${user.email}</p>
                            <p class="mb-1">PLZ: ${user.zipcode}</p>
                            <p class="mb-0">${statusBadge} ${adminBadge}</p>
                        </div>
                    </div>
                </div>
            `);
    });

    // Badge Events
    $(".toggle-status").off("click").on("click", function() {
        const uname = $(this).data("username");
        const user = users.find(u => u.username === uname);
        if (user) user.active = !user.active;
        applyFilterAndSort();
    });
    $(".toggle-admin").off("click").on("click", function() {
        const uname = $(this).data("username");
        const user = users.find(u => u.username === uname);
        if (user) user.admin = !user.admin;
        applyFilterAndSort();
    });
}

function sortUsers(list, key, asc) {
    return [...list].sort((a, b) => {
        let va = a[key], vb = b[key];
        if (typeof va === "boolean") { va = va ? 1 : 0; vb = vb ? 1 : 0; }
        if (typeof va === "string") { va = va.toLowerCase(); vb = vb.toLowerCase(); }
        return (va > vb ? 1 : -1) * (asc ? 1 : -1);
    });
}

function applyFilterAndSort() {
    const filter = $("#filter-all").val().toLowerCase();
    const filtered = users.filter(u =>
                                      Object.values(u).some(val => String(val).toLowerCase().includes(filter))
    );
    const sorted = currentSort.key
        ? sortUsers(filtered, currentSort.key, currentSort.asc)
        : filtered;
    renderUsers(usersFromAPI);
}

$("#filter-all").on("input", applyFilterAndSort);
$("#sort-dropdown").on("change", function() {
    currentSort.key = $(this).val();
    currentSort.asc = true;
    applyFilterAndSort();
});

$(document).on("click", "th.sortable", function() {
    const key = $(this).data("key");
    if (currentSort.key === key) currentSort.asc = !currentSort.asc;
    else currentSort = { key: key, asc: true };
    applyFilterAndSort();
});