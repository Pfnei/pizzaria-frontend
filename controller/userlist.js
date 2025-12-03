import { userService } from "../services/userService.js";
import { authManager } from "../services/authManager.js";

let users = [];
let currentSort = { key: "", asc: true };

// Entry-Point, wenn DOM fertig ist
$(async function () {
  console.log("isAdmin:", authManager.isAdmin());
  console.log("currentUser:", authManager.getUser());

  // nur admins jo
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

    console.log("Benutzerliste vom Server:", data);
    users = data;
    renderUsers(users);
  } catch (err) {
    console.error("Fehler beim Laden der User:", err);
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

    // Tabelle (Zeile klickbar)
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

    // Cards (Card klickbar)
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

  // Klick auf Row oder Card → Userdetails (Bearbeiten)
  $(document)
    .off("click.userNav")
    .on("click.userNav", ".user-row, .user-card", function () {
      const id = $(this).data("userId"); 
      if (!id) return;
      const url = `../views/userdetails.html?id=${encodeURIComponent(id)}`;
      window.location.href = url;
    });
}

function sortUsers(list, key, asc) {
  return [...list].sort((a, b) => {
    let va = a[key], vb = b[key];
    if (typeof va === "boolean") { va = va ? 1 : 0; vb = vb ? 1 : 0; }
    if (typeof va === "string")  { va = va.toLowerCase(); vb = vb.toLowerCase(); }
    if (va === vb) return 0;
    return (va > vb ? 1 : -1) * (asc ? 1 : -1);
  });
}

function applyFilterAndSort() {
  const filter = ($("#filter-all").val() || "").toLowerCase();

  const filtered = users.filter(u =>
    Object.values(u).some(val =>
      String(val).toLowerCase().includes(filter)
    )
  );

  const sorted = currentSort.key
    ? sortUsers(filtered, currentSort.key, currentSort.asc)
    : filtered;

  renderUsers(sorted);
}

function registerUiEvents() {
  // Filter
  $("#filter-all").on("input", applyFilterAndSort);

  // Dropdown-Sortierung
  $("#sort-dropdown").on("change", function() {
    currentSort.key = $(this).val();
    currentSort.asc = true;
    applyFilterAndSort();
  });

  // Klick auf Tabellen-Header
  $(document).on("click", "th.sortable", function() {
    const key = $(this).data("key");
    if (currentSort.key === key) {
      currentSort.asc = !currentSort.asc;
    } else {
      currentSort = { key, asc: true };
    }
    applyFilterAndSort();
  });
}
