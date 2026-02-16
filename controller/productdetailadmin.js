'use strict';

import {productService} from '../services/productService.js';
import {authManager} from '../services/authManager.js';
import {fileService} from "../services/fileService.js";
import {formatDate, formatUserName} from '../utils/helpers.js';
import {orderService} from "../services/orderService.js";


redirectToMenu();

let hasSubmittedForm = false;
let liveCheckFields = false;
let currentProductId = null;


const deleteButton = document.getElementById('deleteButton');
const toProductListBtn = document.getElementById('toProductListBtn');
const productImage = document.getElementById('productImage');
const productUploadInput = document.getElementById('productUploadInput');
const hreftoProductList = 'productlist.html';
const form = document.getElementById('productInformationForm');

const BACKEND = "http://localhost:8081";

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


        deleteButton.addEventListener('click', () => {
            if (confirm("Möchtest du diese Produkt wirklich löschen?")) {
                deleteProduct();
            }
        });

        productImage.addEventListener('click', () => {
            if (productUploadInput) productUploadInput.click();
        });


        productUploadInput.addEventListener('change', async (event) => {
            const file = event.target.files[0];
            if (!file) return;

            try {
                // 1. Upload zum Server
                await fileService.uploadProductPicture(currentProductId, file);


                // 2. Alten Speicher (Blob-URL) im Browser freigeben
                if (productImage.src.startsWith('blob:')) {
                    URL.revokeObjectURL(productImage.src);
                }

                // 3. Neue lokale Vorschau erstellen
                const localUrl = URL.createObjectURL(file);
                productImage.src = localUrl;


                console.log("Upload erfolgreich!");

            } catch (err) {
                // Hier wird der Fehler gefangen, falls der Upload fehlschlägt
                console.error("Fehler beim Hochladen des Produktbilds:", err);
                console.log("Fehler beim Hochladen des Produktbilds.");
            }


        });

        await loadProduct(currentProductId);

        // Form setup

        changeEnterToTab(form);

        form.addEventListener('submit', handleFormSubmit);

    });
}

async function loadProduct(productId) {
    try {
        const product = await productService.getById(productId);


        if (!product) {
            console.log("Produkt nicht gefunden.");
            window.location.href = "../views/menu.html";
            return;
        }

        const productImg = document.getElementById("productImage");


        try {
            const blob = await fileService.downloadProductPicture(productId);
            const url = URL.createObjectURL(blob);
            productImg.src = url;
        } catch (e) {
            console.error("Produktbild konnte nicht geladen werden:", e);

        }


        setValue("productName", product.productName || "");
        setValue("productDescription", product.productDescription || "");

        setValue("price", product.price.toFixed(2) || "");
        setValue("mainCategory", product.mainCategory || "");
        setValue("subCategory", product.subCategory || "");

        setText("createdAt", formatDate(product.createdAt));
        setText("createdBy", formatUserName(product.createdBy));
        setText("lastUpdatedAt", formatDate(product.lastUpdatedAt));
        setText("lastUpdatedBy", formatUserName(product.lastUpdatedBy));


        const activeEl = document.getElementById("isActive");
        if (activeEl) activeEl.checked = !!product.active;

        const vegetarianEl = document.getElementById("isVegetarian");
        if (vegetarianEl) vegetarianEl.checked = !!product.vegetarian;

        // Allergene zurücksetzen
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
        console.error("Fehler beim Laden:", err);
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


if (toProductListBtn) {
    directToProductList();
}


// Mapping MainCategory Dropdown -> Enum
function mapMainCategoryToEnum(value) {
    const mapping = {
        'MAIN_COURSE': 'MAIN_COURSE', 'STARTER': 'STARTER', 'DRINK': 'DRINK', 'DESSERT': 'DESSERT'
    };
    return mapping[value] || null;
}

// Mapping SubCategory Dropdown -> Enum
function mapSubCategoryToEnum(value) {
    const validSubCategories = ['PIZZA', 'PASTA', 'BOWL', 'ALCOHOL_FREE', 'BEER', 'WINE', 'COFFEE', 'SPIRIT'];
    const val = value?.toUpperCase();
    return validSubCategories.includes(val) ? val : null;
}


// Save-Button Handler
async function saveFormData() {
    console.log("Save Button geklickt");

    if (!currentProductId) {
        console.log("Keine Product-ID vorhanden.");
        return;
    }

    if (!authManager.isLoggedIn() || !authManager.isAdmin()) {
        window.location.href = '../views/menu.html';
        return;
    }

    const productDTO = {
        productName: document.getElementById('productName')?.value || '',
        productDescription: document.getElementById('productDescription')?.value || '',
        price: parseFloat(document.getElementById('price')?.value || 0),
        vegetarian: document.getElementById('isVegetarian')?.checked || false,
        active: document.getElementById('isActive')?.checked || false,
        mainCategory: mapMainCategoryToEnum(document.getElementById('mainCategory')?.value),
        subCategory: mapSubCategoryToEnum(document.getElementById('subCategory')?.value),
        allergens: Array.from(document.querySelectorAll('#allergen-container input[type="checkbox"]:checked'))
                        .map(el => el.value)
    };

    console.log('Produkt DTO:', productDTO);

    try {
        const result = await productService.updateProduct(currentProductId, productDTO);
        console.log('Produkt erfolgreich upgedated!', result);

        const msgDiv = document.getElementById('productMessage');
        if (msgDiv) {
            msgDiv.textContent = 'Produkt erfolgreich upgedated!';
            msgDiv.className = 'alert alert-success mt-3';
        }

        setTimeout(() => {
            window.location.href = hreftoProductList;
        }, 2000);


    } catch (error) {
        console.error('Fehler beim Updaten des Produkts:', error.response?.data || error);
        const msgDiv = document.getElementById('productMessage');
        if (msgDiv) {
            msgDiv.textContent = 'Fehler beim Updatendes Produkts!';
            msgDiv.className = 'alert alert-danger mt-3';

        } else {
            alert('Fehler beim Updaten des Produkts!');
        }
    }
}


async function deleteProduct() {
    console.log("Delete Button geklickt");

    if (!currentProductId) {
        console.log("Keine Product-ID vorhanden.");
        return;
    }


    if (!authManager.isLoggedIn() || !authManager.isAdmin()) {
        window.location.href = '../views/menu.html';
        return;
    }


    try {



        console.log("Hallo");
        const orders = await orderService.getAll({params: {productId: currentProductId}});
        console.log('Orders !', orders);

        if (orders.length > 0) {

            console.log('Produkt kann nicht gelöscht werden, da es in Bestellungen vorhanden ist', orders);

            const result = await productService.updateProduct(currentProductId, {
                active: false
            });


            const msgDiv = document.getElementById('productMessage');
            if (msgDiv) {
                msgDiv.textContent = 'Produkt ist in Bestellungen vorhanden - kann nicht gelöscht werden. Es wurde INAKTIV gesetzt!';
                msgDiv.className = 'alert alert-warning mt-3';
            }

            setTimeout(() => {
                window.location.href = hreftoProductList;
            }, 5000);


        } else {
            const result = await productService.delete(currentProductId);
            console.log('Produkt erfolgreich gelöscht!', result);

            const msgDiv = document.getElementById('productMessage');
            if (msgDiv) {
                msgDiv.textContent = 'Produkt erfolgreich gelöscht!';
                msgDiv.className = 'alert alert-success mt-3';
            }

            setTimeout(() => {
                window.location.href = hreftoProductList;
            }, 2000);

        }


    } catch (error) {
        console.error('Fehler beim Löschen des Produkts:', error.response?.data || error);
        const msgDiv = document.getElementById('productMessage');
        if (msgDiv) {
            msgDiv.textContent = 'Fehler beim Löschen Produkts!';
            msgDiv.className = 'alert alert-danger mt-3';
        } else {
            alert('Fehler beim Löschen des Produkts!');
        }
    }
}


function handleFormSubmit(event) {
    event.preventDefault(); // no standard HTML Checks are done
    const form = event.target; // gets the current form
    const isValid = validateForm();

    form.classList.add('was-validated'); // shows Bootstrap styles

    // settings after first submit
    if (!hasSubmittedForm) {
        hasSubmittedForm = true;
        bindLiveValidation(); // live validation with every input
        //setSelectsValid(["anrede", "diversDetailsGroup", "land"]); // selects are always true
    }

    if (isValid) {saveFormData();}

}


function validateForm() {
    let isFormValid = true;
    isFormValid = validateNotEmpty('productName') && isFormValid;
    isFormValid = validateNumeric('price', false) && isFormValid;
    return isFormValid;
}


function setSelectsValid(arrayOfIds) {
    if (!Array.isArray(arrayOfIds)) return;

    let count = 0;
    for (const id of arrayOfIds) {
        const element = document.getElementById(id);
        if (!element) continue;

        element.classList.add('is-valid');
    }
    return;
}


function bindLiveValidation() {
    if (liveCheckFields) return;
    liveCheckFields = true;

    // Map: field -> Validator-Funktion - for each field the correct validator function is called
    const validators = {
        productName: () => validateNotEmpty('productName'), price: () => validateNumeric('price', false)
    };


    //bind for each field the suitable event
    Object.keys(validators).forEach((fieldId) => {
        const element = document.getElementById(fieldId);
        if (!element) return;

        const handler = () => {
            if (!hasSubmittedForm) return;
            validators[fieldId]();
        };

        if (element.tagName === 'SELECT') {
            element.addEventListener('change', handler);
        } else {
            element.addEventListener('input', handler);
            // also if the focus is lost
            element.addEventListener('blur', handler);
        }
    });
}


function redirectToMenu() {
    if (!authManager.isLoggedIn() || !authManager.isAdmin()) {
        console.log("Nicht eingeloggt oder kein Admin - Weiterleitung...");
        window.location.href = '../views/menu.html';
    }
}

// Button zu ProductList
function directToProductList() {
    toProductListBtn.addEventListener('click', function () {
        window.location.href = hreftoProductList;
    });
}
