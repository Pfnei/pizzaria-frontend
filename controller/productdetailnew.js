'use strict';

import {productService} from '../services/productService.js';
import {authManager} from '../services/authManager.js';
import {fileService} from "../services/fileService.js";


redirectToMenu();


let hasSubmittedForm = false;
let liveCheckFields = false;

const toProductListBtn = document.getElementById('toProductListBtn');
const hreftoProductList = 'productlist.html';
const productImage = document.getElementById('productImage');
const productUploadInput = document.getElementById('productUploadInput');
const form = document.getElementById('productInformationForm');


let tempProductPicture;

initPage();

function initPage() {
    document.addEventListener('DOMContentLoaded', async () => {

        productImage.addEventListener('click', () => {
            if (productUploadInput) productUploadInput.click();
        });

        changeEnterToTab(form);

        form.addEventListener('submit', handleFormSubmit);

        productUploadInput.addEventListener('change', async (event) => {
            const file = event.target.files[0];
            if (!file) return;
            tempProductPicture = file;

            try {

                if (productImage.src.startsWith('blob:')) {
                    URL.revokeObjectURL(productImage.src);
                }

                const localUrl = URL.createObjectURL(file);
                productImage.src = localUrl;
                productImage.setAttribute("class", "img-fluid");
            } catch (err) {
            }
        });
    });
}

if (toProductListBtn) {
    toProductListBtn.addEventListener('click', redirectToProductList);
}

function redirectToProductList() {
    window.location.href = hreftoProductList;
}


function mapMainCategoryToEnum(value) {
    const mapping = {
        'MAIN_COURSE': 'MAIN_COURSE', 'STARTER': 'STARTER', 'DRINK': 'DRINK', 'DESSERT': 'DESSERT'
    };
    return mapping[value] || null;
}


function resetProductForm() {
    document.getElementById('productName').value = '';
    document.getElementById('productDescription').value = '';
    document.getElementById('price').value = '';
    document.getElementById('mainCategory').selectedIndex = 0;
    document.getElementById('isVegetarian').checked = false;
    document.getElementById('isActive').checked = false;
    productImage.src = "../pictures/ProductAvatar.png";
    productImage.setAttribute("class", "img-fluid-initial");

    document.querySelectorAll('#allergen-container input[type="checkbox"]').forEach(el => el.checked = false);

    hasSubmittedForm = false;
    liveCheckFields = false;
    form.classList.remove('was-validated');

    const msgDiv = document.getElementById('productMessage');
    if (msgDiv) {
        msgDiv.textContent = 'Produkt erfolgreich angelegt!';
        msgDiv.className = 'alert alert-success mt-3';
    }

    setTimeout(() => {
        window.location.href = 'productdetailnew.html';
    }, 2000);
}


async function saveFormData() {

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
        const result = await productService.create(productDTO);
        if (tempProductPicture) {
            await fileService.uploadProductPicture(result.productId, tempProductPicture);
        }

        resetProductForm();

    } catch (error) {
        const msgDiv = document.getElementById('productMessage');
        if (msgDiv) {
            msgDiv.textContent = 'Fehler beim Anlegen des Produkts!';
            msgDiv.className = 'alert alert-danger mt-3';
            msgDiv.style = 'block';
            setTimeout(() => {
                msgDiv.textContent = ''
                msgDiv.className = '';
                msgDiv.style = 'none';
            }, 2000);
        } else {
            alert('Fehler beim Anlegen des Produkts!');
        }
    }
}

async function handleFormSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const isValid = validateForm();

    form.classList.add('was-validated');

    if (!hasSubmittedForm) {
        hasSubmittedForm = true;
        bindLiveValidation();
    }

    if (isValid) await saveFormData();
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

    const validators = {
        productName: () => validateNotEmpty('productName'), price: () => validateNumeric('price', false)
    };

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
            element.addEventListener('blur', handler);
        }
    });
}


function redirectToMenu() {
    if (!authManager.isLoggedIn() || !authManager.isAdmin()) {
        window.location.href = '../views/menu.html';
    }
}

