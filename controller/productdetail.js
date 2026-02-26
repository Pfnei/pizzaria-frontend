'use strict';

import {productService} from '../services/productService.js';
import {fileService} from "../services/fileService.js";
import {formatDate, formatUserName} from '../utils/helpers.js';


let currentProductId = null;

const toMenuBtn = document.getElementById('toMenuBtn');

initPage();

function initPage() {
    document.addEventListener('DOMContentLoaded', async () => {

        const params = new URLSearchParams(window.location.search);
        currentProductId = params.get("id");

        if (!currentProductId) {
            console.warn("Keine id in der URL");
            window.location.href = "../views/menu.html";
            return;
        }

        await loadProduct(currentProductId);


        toMenuBtn.addEventListener('click', function () {
            window.location.href = "../views/menu.html";

        });


    });
}

async function loadProduct(productId) {
    try {
        const product = await productService.getById(productId);

        if (!product) {
            window.location.href = "../views/menu.html";
            return;
        }

        const productImg = document.getElementById("productImage");

        try {
            const blob = await fileService.downloadProductPicture(productId);
            const url = URL.createObjectURL(blob);
            productImg.src = url;
        } catch (e) {
        }

        setValue("productName", product.productName || "");
        setValue("productDescription", product.productDescription || "");

        setValue("price", product.price.toFixed(2) || "");
        setValue("mainCategory", categoryLabel(product.mainCategory || ""));

        setText("createdAt", formatDate(product.createdAt));
        setText("createdBy", formatUserName(product.createdBy));
        setText("lastUpdatedAt", formatDate(product.lastUpdatedAt));
        setText("lastUpdatedBy", formatUserName(product.lastUpdatedBy));

        const vegetarianEl = document.getElementById("isVegetarian");
        if (vegetarianEl) vegetarianEl.checked = !!product.vegetarian;

        document.querySelectorAll('#allergen-container input[type="checkbox"]').forEach(el => el.checked = false);


        if (Array.isArray(product.allergens)) {
            document
                .querySelectorAll('#allergen-container input[type="checkbox"]')
                .forEach(el => {
                    if (product.allergens.includes(el.value)) {
                        el.checked = true;
                    }
                });
        }

    } catch (err) {
        window.location.href = "../views/menu.html";
    }
}

function setValue(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value;
}


function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value ?? "";
}

function categoryLabel(mainCategory) {
    switch (String(mainCategory)) {
        case "STARTER":
            return "Vorspeise";
        case "MAIN_COURSE":
            return "Hauptspeise";
        case "DESSERT":
            return "Nachspeise";
        case "DRINK":
            return "Getränk";
        default:
            return String(mainCategory);
    }
}


