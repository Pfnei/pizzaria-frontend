import { productService } from '../services/productService.js';
import { authManager } from '../services/authManager.js';

'use strict';



redirectToMenu();

const saveButton = document.getElementById('saveButton');
const toProductListBtn = document.getElementById('toProductListBtn');
const hreftoProductList = 'productlist.html';

if (toProductListBtn) {
    directToProductList();
}
if (saveButton) {
    saveButton.addEventListener('click', handleSaveButtonClick);
    console.log("Save-Button Listener erfolgreich registriert.");
} else {
    console.warn("Save-Button nicht gefunden!");
}

// Mapping MainCategory Dropdown -> Enum
function mapMainCategoryToEnum(value) {
    const mapping = {
        'MAIN_COURSE': 'MAIN_COURSE',
        'STARTER': 'STARTER',
        'DRINK': 'DRINK',
        'DESSERT': 'DESSERT'
    };
    return mapping[value] || null;
}

// Mapping SubCategory Dropdown -> Enum
function mapSubCategoryToEnum(value) {
    const validSubCategories = ['PIZZA','PASTA','BOWL','ALCOHOL_FREE','BEER','WINE','COFFEE','SPIRIT'];
    const val = value?.toUpperCase();
    return validSubCategories.includes(val) ? val : null;
}

// Reset-Funktion für alle Inputs
function resetProductForm() {
    document.getElementById('productName').value = '';
    document.getElementById('productDescription').value = '';
    document.getElementById('price').value = '';
    document.getElementById('mainCategory').selectedIndex = 0;
    document.getElementById('subCategory').selectedIndex = 0;
    document.getElementById('isVegetarian').checked = false;
    document.getElementById('isActive').checked = false;

    // Allergene zurücksetzen
    document.querySelectorAll('#allergen-container input[type="checkbox"]').forEach(el => el.checked = false);

    // Formularvalidierung retour setzen
    hasSubmittedForm = false;

    // Erfolgsmeldung
    const msgDiv = document.getElementById('productMessage');
    if (msgDiv) {
        msgDiv.textContent = 'Produkt erfolgreich angelegt!';
        msgDiv.className = 'alert alert-success mt-3';
        setTimeout(() => msgDiv.textContent = '', 3000);
    }
}


// Save-Button Handler
async function handleSaveButtonClick(event) {
    event.preventDefault();
    console.log("Save Button geklickt");

    if (!authManager.isLoggedIn() || !authManager.isAdmin()) {
        window.location.href = '../views/menu.html';
        return;
    }

    const productDTO = {
        productName: document.getElementById('productName')?.value || '',
        description: document.getElementById('productDescription')?.value || '',
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
        const result = await productService.create(productDTO);
        console.log('Produkt erfolgreich hinzugefügt!', result);

        // Formular resetten + Meldung
        resetProductForm();

    } catch (error) {
        console.error('Fehler beim Hinzufügen des Produkts:', error.response?.data || error);
        const msgDiv = document.getElementById('productMessage');
        if (msgDiv) {
            msgDiv.textContent = 'Fehler beim Anlegen des Produkts!';
            msgDiv.className = 'alert alert-danger mt-3';
            setTimeout(() => msgDiv.textContent = '', 5000);
        } else {
            alert('Fehler beim Anlegen des Produkts!');
        }
    }
}


let hasSubmittedForm = false;
let liveCheckFields = false;


initPage();

function initPage() {
    document.addEventListener('DOMContentLoaded', () => {
        const form = document.getElementById('productInformationForm');
        changeEnterToTab(form);

         form.addEventListener('submit', handleFormSubmit);

    });
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

    if (isValid) showSuccessAndRedirect();

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
        productName:   () => validateNotEmpty('productName'),
        price:  () => validateNumeric('price', false)
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


function showSuccessAndRedirect() {

    window.location.href = "../views/menu.html";
    /*const btn = document.querySelector('#userForm button[type="submit"]');
    if (btn) btn.disabled = true;

    const msg = document.getElementById('successMessage');
    if (msg) {
        msg.style.display = 'block';
    }

    setTimeout(() => {
          window.location.href = 'login.html';
      }, 1000);*/
}


function redirectToMenu() {
    if (!authManager.isLoggedIn() || !authManager.isAdmin()) {
        console.log("Nicht eingeloggt oder kein Admin - Weiterleitung...");
        window.location.href = '../views/menu.html';
    }
}

// Button zu ProductList
function directToProductList() {
    toProductListBtn.addEventListener('click', function() {
        window.location.href = hreftoProductList;
    });
}
