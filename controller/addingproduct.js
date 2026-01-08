import { productService } from '../services/productService.js';
import { authManager } from '../services/authManager.js';

redirectToMenu();

const saveButton = document.getElementById('saveButton');
const toProductListBtn = document.getElementById('toProductListBtn');
const hreftoProductList = 'productlists.html';

if (toProductListBtn) {
    directToMenu();
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
    return mapping[value] || 'STARTER';
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
    document.getElementById('isActive').checked = true;

    // Allergene zurücksetzen
    document.querySelectorAll('#allergen-container input[type="checkbox"]').forEach(el => el.checked = false);

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

// Redirect, falls kein Admin
function redirectToMenu() {
    if (!authManager.isLoggedIn() || !authManager.isAdmin()) {
        console.log("Nicht eingeloggt oder kein Admin - Weiterleitung...");
        window.location.href = '../views/menu.html';
    }
}

// Button zu ProductList
function directToMenu() {
    toProductListBtn.addEventListener('click', function() {
        window.location.href = hreftoProductList;
    });
}
