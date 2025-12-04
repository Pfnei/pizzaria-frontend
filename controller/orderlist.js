// controller/orderlist.js
"use strict";

import { orderService } from "../services/orderService.js";
import { authManager } from "../services/authManager.js";

let orders = [];

$(async function () {
  // Nur Admins dürfen die Bestellliste sehen
  if (!authManager.isLoggedIn() || !authManager.isAdmin()) {
    window.location.href = "../views/menu.html";
    return;
  }

  await loadOrders();
  registerFilter();
});

async function loadOrders() {
  try {
    const data = await orderService.getAll(); // Erwartet: List<OrderResponseDTO> oder LightDTO

    if (!data || !Array.isArray(data)) {
      throw new Error("Unerwartete Serverantwort (keine Orderliste)");
    }

    console.log("Orders vom Server:", data);
    orders = data;
    render(orders);
  } catch (err) {
    console.error("Fehler beim Laden der Bestellungen:", err);
    alert("Fehler beim Laden der Bestellungen: " + (err.message || err));
    window.location.href = "../views/menu.html";
  }
}

// Instant (createdAt / deliveredAt) → hübsches Datum
function formatDate(instantString) {
  if (!instantString) return "";
  const d = new Date(instantString);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("de-AT"); // z.B. 01.03.2025
}

function render(list) {
  const tbody = $("#table-body");
  const cards = $("#card-container");
  tbody.empty();
  cards.empty();

  list.forEach((o) => {
    // OrderResponseDTO-Felder
    const deliveredOrCreated = o.deliveredAt || o.createdAt;
    const date = formatDate(deliveredOrCreated);
    const total = o.total ?? 0;

    const firstname = o.firstname || "";
    const lastname = o.lastname || "";
    const zipcode = o.zipcode || "";
    const city = o.city || "";

    const createdBy = o.createdBy || {};
    const username = createdBy.username || "";
    const email = createdBy.email || "";

    // Tabellenzeile
    tbody.append(`
      <tr class="order-row">
        <td>${date}</td>
        <td>€ ${Number(total).toFixed(2)}</td>
        <td>${username}</td>
        <td>${firstname}</td>
        <td>${lastname}</td>
        <td>${email}</td>
        <td>${zipcode}</td>
      </tr>
    `);

    // Card-Ansicht (mobil)
    cards.append(`
      <div class="col-12 col-sm-6 col-md-4">
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
}

function registerFilter() {
  $("#filter-all").on("input", () => {
    const q = ($("#filter-all").val() || "").toLowerCase();
    if (!q) {
      render(orders);
      return;
    }

    const filtered = orders.filter((o) => {
      const createdBy = o.createdBy || {};

      const values = [
        o.orderId,
        o.firstname,
        o.lastname,
        o.phoneNumber,
        o.address,
        o.zipcode,
        o.city,
        o.deliveryNote,
        o.total,
        formatDate(o.createdAt),
        formatDate(o.deliveredAt),
        createdBy.username,
        createdBy.firstname,
        createdBy.lastname,
        createdBy.email,
        createdBy.zipcode,
      ];

      return values
        .filter((v) => v != null)
        .some((v) => String(v).toLowerCase().includes(q));
    });

    render(filtered);
  });

  // Sort-Dropdown & Header sind im HTML noch da, machen aber nix:
  // falls du magst, kannst du sie hier auch deaktivieren:
  $("#sort-dropdown").prop("disabled", true);
  $("th.sortable").addClass("text-muted");
}
