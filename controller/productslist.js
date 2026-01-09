// controller/productslist.js
"use strict";

import { productService } from "../services/productService.js";
import { authManager } from "../services/authManager.js";



let products = [];




$(async function () {
  console.log("isAdmin:", authManager.isAdmin());
  console.log("currentUser:", authManager.getUser());

  // nur Admins dürfen diese Seite sehen
  if (!authManager.isLoggedIn() || !authManager.isAdmin()) {
    window.location.href = "../views/menu.html";
    return;
  }

  enableAddingProductsUi();

  await loadProducts();
  disableFilterAndSortUi(); // optional: Bedienelemente visuell deaktivieren

  switchToProductsListView();
});

async function loadProducts() {
  try {
    const data = await productService.getAll(); // Erwartet: List<ProductResponseDTO> oder LightDTO

    if (!data || !Array.isArray(data)) {
      throw new Error("Unerwartete Serverantwort (keine Produktliste)");
    }
  //  const productArray = data.content ? data.content : data; // Falls paginierte Antwort

    console.log("Produkte vom Server:", data);
    products = data;
    renderProducts(products);
  } catch (err) {
    console.error("Fehler beim Laden der Produkte:", err);
    alert("Fehler beim Laden der Produkte: " + (err.message || err));
    window.location.href = "../views/menu.html";
  }
}

function renderProducts(list) {
  const tbody = $("#table-body");
  const cards = $("#card-container");
  tbody.empty();
  cards.empty();

  if(!list || list.length === 0) {
    console.warn("Keine Produkte zum Anzeigen vorhanden.");
    return;
  }

const sortedList = Enumerable.from(list)
    .orderBy(p => p.mainCategory) // Erst nach Kategorie
    .thenBy(p => p.productName)   // Dann nach Name
    .toArray();

  sortedList.forEach(p => {
    // DTO-Felder gemäß ProductResponseDTO
    const name = p.productName || "";
    const mainCategory = p.mainCategory || "";
    const subCategory = p.subCategory || "";
    const price = p.price ?? 0;
    const active = !!p.active;
    const vegetarian = !!p.vegetarian;

    const statusBadge = `
      <span class="badge ${active ? "bg-success" : "bg-secondary"}">
        ${active ? "aktiv" : "inaktiv"}
      </span>
    `.trim();

    const vegBadge = vegetarian
      ? `<span class="badge bg-success ms-1">vegi</span>`
      : "";

    // Tabelle
    tbody.append(`
      <tr class="product-row">
        <td>${name}</td>
        <td>${mainCategory}</td>
        <td>${subCategory}</td>
        <td>€ ${Number(price).toFixed(2)}</td>
        <td class="text-center">${statusBadge} ${vegBadge}</td>
      </tr>
    `);

    // Cards
    cards.append(`
      <div class="col-12 col-sm-6 col-md-4">
        <div class="card h-100 product-card">
          <div class="card-body p-2">
            <p class="mb-1 fw-semibold">${name}</p>
            <p class="mb-1">${mainCategory}${subCategory ? " – " + subCategory : ""}</p>
            <p class="mb-1">€ ${Number(price).toFixed(2)}</p>
            <p class="mb-0">${statusBadge} ${vegBadge}</p>
          </div>
        </div>
      </div>
    `);
  });
}

function disableFilterAndSortUi() {
  //filter vorerstal komplett still legen
  $("#filter-all").prop("disabled", true);
  $("#sort-dropdown").prop("disabled", true);
  $("th.sortable").addClass("text-muted");
}

function enableAddingProductsUi() {
  if(!$("#addingProductAdmin")) return;
  const addButton = $("#addingProductAdmin");
  if(authManager.isLoggedIn() && authManager.isAdmin()) {
    addButton.show();
  } else {
    addButton.hide();
  }
  $("#addingProductAdmin").prop("disabled", false);
}

function switchToProductsListView() {
  if(!authManager.isLoggedIn() || !authManager.isAdmin()) return;
  if(!$("#addingProductAdmin")) return;
  const addButton = $("#addingProductAdminbtn");
  addButton.on("click", function() {
    window.location.href = "../views/addingproduct.html";
  });
  
}
