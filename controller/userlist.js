// userlist.js
import { api } from "../services/BaseApiService.js";
import { UserStorageService } from "../services/UserStorageService.js";


const state = {
    users: [],
    currentSortKey: "",
    sortAsc: true
};

//if no admin logged in, redirect to menu view
if (!UserStorageService.isAdmin()) {
    console.log("kein admin und daher redirect zu menu view");
    window.location.href = "../views/menu.html";
}

// --- API Call, wrapped in Promise (wie vorher) ---
function fetchUsers() {
    return new Promise((resolve, reject) => {
        api.get("/users")
            .done(data => {
                state.users = data || [];
                resolve(state.users);
            })
            .fail((xhr, status, error) => {
                api.handleError(xhr, status, error);
                reject(error);
            });
    });
}


function normalizeValue(v) {
    if (typeof v === "boolean") return v ? 1 : 0;
    if (typeof v === "string") return v.toLowerCase();
    return v;
}

// Filter + Sort LINQ style :D, c# beschte
function applyFilterAndSort() {
    const filter = ($("#filter-all").val() || "").toString().toLowerCase();

    // Start: alle Benutzer
    let query = Enumerable.from(state.users);

    // Filter
    if (filter) {
        query = query.where(u =>
            Object.values(u).some(val =>
                String(val).toLowerCase().includes(filter)
            )
        );
    }

    // sort
    if (state.currentSortKey) {
        const key = state.currentSortKey;

        if (state.sortAsc) {
            query = query.orderBy(u => normalizeValue(u[key]));
        } else {
            query = query.orderByDescending(u => normalizeValue(u[key]));
        }
    }

    const result = query.toArray();
    renderUsers(result);
}


function renderUsers(list) {
    const tbody = $("#table-body");
    const cards = $("#card-container");
    tbody.empty();
    cards.empty();

    list.forEach(user => {
        const statusBadge = `
            <span class="badge ${user.active ? "bg-success" : "bg-secondary"} 
                        toggle-status" 
                  data-username="${user.username}">
                ${user.active ? "Aktiv" : "Inaktiv"}
            </span>`.trim();

        const adminBadge = `
            <span class="badge ${user.admin ? "bg-success" : "bg-secondary"} 
                        toggle-admin" 
                  data-username="${user.username}">
                ${user.admin ? "Ja" : "Nein"}
            </span>`.trim();

        // Tabelle
        tbody.append(`
            <tr>
                <td>${user.username}</td>
                <td>${user.firstname}</td>
                <td>${user.surname}</td>
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

    // Badge Events – aktualisieren State und rendern neu
    $(".toggle-status")
        .off("click")
        .on("click", function () {
            const uname = $(this).data("username");
            const user = state.users.find(u => u.username === uname);
            if (user) {
                user.active = !user.active;
                applyFilterAndSort();
            }
        });

    $(".toggle-admin")
        .off("click")
        .on("click", function () {
            const uname = $(this).data("username");
            const user = state.users.find(u => u.username === uname);
            if (user) {
                user.admin = !user.admin;
                applyFilterAndSort();
            }
        });
}





$(document).ready(function () {
    // Navigation / Footer laden 
    $("#navigation").load("../views/navigation.html");
    $("#footer").load("../views/footer.html");

    // Filter-Input
    $("#filter-all").on("input", () => applyFilterAndSort());

    // Sort-Dropdown
    $("#sort-dropdown").on("change", function () {
        state.currentSortKey = $(this).val() || "";
        state.sortAsc = true; // bei Änderung des Dropdowns immer wieder auf asc
        applyFilterAndSort();
    });

    // Klick auf Tabellen-Header
    $(document).on("click", "th.sortable", function () {
        const key = $(this).data("key");
        if (!key) return;

        if (state.currentSortKey === key) {
            // Gleiche Spalte nochmal -> Richtung umdrehen
            state.sortAsc = !state.sortAsc;
        } else {
            // Neue Spalte -> auf asc setzen
            state.currentSortKey = key;
            state.sortAsc = true;
        }

        applyFilterAndSort();
    });


    (async function init() {
        try {
            await fetchUsers();
            applyFilterAndSort();
        } catch (e) {
            console.error("Failed loading users", e);
        }
    })();
});
