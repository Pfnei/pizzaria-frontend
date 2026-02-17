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
        console.log(products);

        renderProducts(container, list);

        const vegFlip = document.getElementById("veg-flip");

        if (vegFlip) {
            vegFlip.addEventListener("change", () => {
                const filtered = vegFlip.checked
                    ? list.filter(p => p.vegetarian === true)
                    : list;

                renderProducts(container, filtered);
            });
        }

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
        let idVar;
        switch (title) {
            case "Vorspeisen":
                idVar = "item-1";
                break;
            case "Hauptspeisen":
                idVar = "item-2";
                break;
            case "Nachspeisen":
                idVar = "item-3";
                break;
            case "Getränke":
                idVar = "item-4";
                break;
        }
        return `
          <div class="product-div mb-4" id=${idVar}>
            <h4 class="mb-3">${escapeHtml(title)}</h4>
            ${cards}
          </div>
        `;
    }).join("");

    container.innerHTML = `
      <div class="container sc" data-bs-target="sidebar-nav" data-bs-spy="scroll" data-bs-smooth-scroll="true" tabindex="0">
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

    // Allergene als kleine graue Badges
    const allergenBadges = (p.allergens || [])
        .map(a => `<span class="badge bg-light text-muted border me-1" style="font-size: 0.7rem;">${escapeHtml(a)}</span>`)
        .join("");

    return `
      <div class="card cardstyle mb-3">
        <div class="card-body">
          <div class="d-flex justify-content-between mb-1">
            <h5 class="card-title mb-0">${escapeHtml(p.productName)}${vegetarianBadge} 
              <a href="../views/productdetail.html?id=${encodeURIComponent(p.productId)}">
                <i class="bi bi-info-circle-fill"></i>
              </a>
            </h5>
            <span class="fw-bold text-primary">${formatEuro(p.price)}</span>
          </div>
          
          <p class="card-text text-muted small mb-2">
            ${p.productDescription ? escapeHtml(p.productDescription) : "Keine Beschreibung verfügbar."}
          </p>

          <div class="d-flex justify-content-between align-items-center">
            <div class="allergens-list">
                ${allergenBadges}
            </div>

            <button class="btn btn-primary btn-sm" type="button"
              data-add="1"
              data-product-id="${escapeHtmlAttr(p.productId)}"
              data-product-name="${escapeHtmlAttr(p.productName)}"
              data-product-price="${String(Number(p.price) || 0)}"
              data-product-vegetarian="${String(Boolean(p.vegetarian))}"
            >
              <i class="bi bi-cart4 me-1"></i> In den Warenkorb
            </button>
          </div>
        </div>
      </div>
    `;
}

function categoryLabel(mainCategory) {
    switch (String(mainCategory)) {
        case "STARTER": return "Vorspeisen";
        case "MAIN_COURSE": return "Hauptspeisen"; // Korrigiert passend zum JSON
        case "DESSERT": return "Nachspeisen";
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

