// menu.js
import { authManager } from "../services/authManager.js";
import { productService } from "../services/productService.js";
import { addToCart } from "../utils/cartStorage.js";

document.addEventListener("DOMContentLoaded", async function () {
    const adminspace = document.getElementById("adminspace");
    if (adminspace) {
        adminspace.style.display = authManager.isAdmin() ? "block" : "none";
    }

    const container = document.getElementById("products-container");
    if (!container) {
        console.error("products-container not found");
        return;
    }

    try {
        const products = await productService.getAllProducts(); // GET /products
        const list = Array.isArray(products) ? products.filter(p => p?.active !== false) : [];

        renderProducts(container, list);
    } catch (err) {
        console.error("Failed loading products:", err);
        container.innerHTML = `
          <div class="alert alert-danger">
            Produkte konnten nicht geladen werden: ${escapeHtml(err?.message || "Unbekannter Fehler")}
          </div>
        `;
    }
});

function renderProducts(container, products) {
    if (!Array.isArray(products) || products.length === 0) {
        container.innerHTML = `<div class="text-muted p-3">Keine Produkte verfügbar.</div>`;
        return;
    }

    const groups = groupBy(products, (p) => p.mainCategory || "OTHER");

    const sections = Object.entries(groups).map(([cat, items]) => {
        const title = categoryLabel(cat);
        const cards = items.map(productCardHtml).join("");
        return `
          <div class="product-div mb-4">
            <h4 class="mb-3">${escapeHtml(title)}</h4>
            ${cards}
          </div>
        `;
    }).join("");

    container.innerHTML = `
      <div class="container">
        ${sections}
      </div>
    `;


    container.querySelectorAll("[data-add]").forEach((btn) => {
        btn.addEventListener("click", () => {
            const productId = btn.getAttribute("data-product-id");
            const productName = btn.getAttribute("data-product-name");
            const price = Number(btn.getAttribute("data-product-price")) || 0;
            const vegetarian = btn.getAttribute("data-product-vegetarian") === "true";

            if (!productId) {
                console.error("Missing productId on button", btn);
                return;
            }

            addToCart({ productId, productName, price, vegetarian }, 1);

            // Debug: siehst du sofort im Storage
            console.log("added to cart:", { productId, productName, price, vegetarian });

            btn.disabled = true;
            setTimeout(() => (btn.disabled = false), 250);
        });
    });
}

function productCardHtml(p) {
    const vegetarianBadge = p.vegetarian
        ? ` <i class="bi bi-leaf-fill text-success" title="Vegetarisch"></i>`
        : "";

    return `
      <div class="card cardstyle mb-3">
        <div class="card-body">
          <div class="d-flex justify-content-between mb-2">
            <h5 class="card-title">${escapeHtml(p.productName)}${vegetarianBadge}</h5>
            <h5 class="card-title">Preis: ${formatEuro(p.price)}</h5>
          </div>

          <div class="d-flex justify-content-end">
            <button class="btn btn-primary" type="button"
              data-add="1"
              data-product-id="${escapeHtmlAttr(p.productId)}"
              data-product-name="${escapeHtmlAttr(p.productName)}"
              data-product-price="${String(Number(p.price) || 0)}"
              data-product-vegetarian="${String(Boolean(p.vegetarian))}"
            >
              <i class="bi bi-cart4 me-2"></i> In den Warenkorb
            </button>
          </div>
        </div>
      </div>
    `;
}

function categoryLabel(mainCategory) {
    switch (String(mainCategory)) {
        case "STARTER": return "Vorspeisen";
        case "MAIN": return "Hauptspeisen";
        case "DESSERT": return "Nachspeise";
        case "DRINK": return "Getränke";
        default: return String(mainCategory);
    }
}

function groupBy(arr, keyFn) {
    return arr.reduce((acc, x) => {
        const k = String(keyFn(x));
        acc[k] = acc[k] || [];
        acc[k].push(x);
        return acc;
    }, {});
}

function formatEuro(value) {
    const v = Number(value) || 0;
    return "€" + v.toFixed(2).replace(".", ",");
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