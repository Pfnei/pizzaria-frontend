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


initPage();

function initPage() {
    document.addEventListener('DOMContentLoaded', async () => {

        const params = new URLSearchParams(window.location.search);
        currentProductId = params.get("id");

        if (!currentProductId) {
            window.location.href = "../views/menu.html";
            return;
        }


        deleteButton.addEventListener('click', async () => {

            const result = await Swal.fire({
                                               title: 'Möchtest du diese Produkt wirklich löschen?',
                                               text: 'Dieser Vorgang kann nicht rückgängig gemacht werden!',
                                               icon: 'warning',
                                               showCancelButton: true,
                                               confirmButtonText: 'Ja, löschen',
                                               cancelButtonText: 'Abbrechen',
                                               confirmButtonColor: '#dc3545'
                                           });

            if (result.isConfirmed) {
                await deleteProduct();
            }
        });

        productImage.addEventListener('click', () => {
            if (productUploadInput) productUploadInput.click();
        });


        productUploadInput.addEventListener('change', async (event) => {
            const file = event.target.files[0];
            if (!file) return;

            try {
                await fileService.uploadProductPicture(currentProductId, file);

                if (productImage.src.startsWith('blob:')) {
                    URL.revokeObjectURL(productImage.src);
                }

                const localUrl = URL.createObjectURL(file);
                productImage.src = localUrl;

            } catch (err) {
            }
        });

        await loadProduct(currentProductId);

        changeEnterToTab(form);
        form.addEventListener('submit', handleFormSubmit);
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
        setValue("mainCategory", product.mainCategory || "");

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


// Save-Button Handler
async function saveFormData() {

    if (!currentProductId) {
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
        allergens: Array.from(document.querySelectorAll('#allergen-container input[type="checkbox"]:checked'))
                        .map(el => el.value)
    };

    try {
        const result = await productService.updateProduct(currentProductId, productDTO);

        const msgDiv = document.getElementById('productMessage');
        if (msgDiv) {
            msgDiv.textContent = 'Produkt erfolgreich upgedated!';
            msgDiv.className = 'alert alert-success mt-3';
        }

        setTimeout(() => {
            window.location.href = hreftoProductList;
        }, 2000);


    } catch (error) {
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

    if (!currentProductId) {
        return;
    }


    if (!authManager.isLoggedIn() || !authManager.isAdmin()) {
        window.location.href = '../views/menu.html';
        return;
    }


    try {
        const orders = await orderService.getAll({params: {productId: currentProductId}});

        if (orders.length > 0) {
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
        window.location.href = '../views/menu.html';
    }
}

// Button zu ProductList
function directToProductList() {
    toProductListBtn.addEventListener('click', function () {
        window.location.href = hreftoProductList;
    });
}
