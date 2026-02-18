// controller/productslist.js
"use strict";

import { productService } from "../services/productService.js";
import { authManager } from "../services/authManager.js";
import {sortList} from "../utils/helpers.js";



let products = [];
let currentSort = {key: "", asc: true};



$(async function () {
  console.log("isAdmin:", authManager.isAdmin());
  console.log("currentUser:", authManager.getUser());

  // nur Admins dürfen diese Seite sehen
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



  list.forEach(p => {
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

    // Tabelle (Zeile klickbar)
    tbody.append(`
      <tr class="product-row" data-product-id="${p.productId}">
        <td>${name}</td>
        <td>${mainCategory}</td>
        <td>${subCategory}</td>
        <td>€ ${Number(price).toFixed(2)}</td>
        <td class="text-center">${vegBadge}</td>
        <td class="text-center">${statusBadge}</td>
      </tr>
    `);

    // Cards (Card klickbar)
    cards.append(`
      <div class="col-12 col-sm-6 col-md-4" data-product-id="${p.productId}" >
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

  // Klick auf Row oder Card → Produtcdetails (Bearbeiten)
  $(document)
      .off("click.productNav")
      .on("click.productNav", ".product-row, .product-card", function () {
        const id = $(this).data("productId");
        if (!id) return;
        let url;
        if (authManager.isAdmin()) {
          url = `../views/productdetailadmin.html?id=${encodeURIComponent(id)}`;
        }
        else {
          url = `../views/productdetail.html?id=${encodeURIComponent(id)}`;
        }
        window.location.href = url;
      });
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

  const sorted = currentSort.key
      ? sortList(filtered, currentSort.key, currentSort.asc)
      : filtered;

  renderProducts(sorted);
}





function enableAddingProductsUi() {
  if(!$("#addingProductAdmin")) return;
  const addButton = $("#addingProductAdmin");
  if(authManager.isLoggedIn() && authManager.isAdmin()) {
    addButton.show();
    addButton.on("click", function() {
      window.location.href = "../views/productdetailnew.html";});
  } else {
    addButton.hide();
  }
  $("#addingProductAdmin").prop("disabled", false);

}



function registerUiEvents() {
  // Filter
  $("#filter-all").on("input", applyFilterAndSort);

  // Dropdown-Sortierung
  $("#sort-dropdown").on("change", function () {
    currentSort.key = $(this).val();
    currentSort.asc = true;
    applyFilterAndSort();
  });

  // Klick auf Tabellen-Header
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