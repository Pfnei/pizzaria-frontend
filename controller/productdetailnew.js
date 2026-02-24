import {productService} from '../services/productService.js';
import {authManager} from '../services/authManager.js';
import {fileService} from "../services/fileService.js";


'use strict';


redirectToMenu();


let hasSubmittedForm = false;
let liveCheckFields = false;

const toProductListBtn = document.getElementById('toProductListBtn');
const hreftoProductList = 'productlist.html';
const productImage = document.getElementById('productImage');
const productUploadInput = document.getElementById('productUploadInput');
const form = document.getElementById('productInformationForm');

const BACKEND = "http://localhost:8081";

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

                // 2. Alten Speicher (Blob-URL) im Browser freigeben
                if (productImage.src.startsWith('blob:')) {
                    URL.revokeObjectURL(productImage.src);
                }

                // 3. Neue lokale Vorschau erstellen
                const localUrl = URL.createObjectURL(file);
                productImage.src = localUrl;
                productImage.setAttribute("class", "img-fluid");

                console.log("Upload erfolgreich (aber noch nicht am Server gespeichert!");

            } catch (err) {
                // Hier wird der Fehler gefangen, falls der Upload fehlschlägt
                console.error("Fehler beim Hochladen des Produktbilds:", err);
                console.log("Fehler beim Hochladen des Produktbilds.");
            }





        });
    });
}

if (toProductListBtn) {

    toProductListBtn.addEventListener('click', redirectToProductList);
    console.log("Back-To-ProductList-Button Listener erfolgreich registriert.");

} else {
    console.warn("Back-To-ProductList-Button nicht gefunden!");
}

function redirectToProductList() {
    window.location.href = hreftoProductList;
}



// Mapping MainCategory Dropdown -> Enum
function mapMainCategoryToEnum(value) {
    const mapping = {
        'MAIN_COURSE': 'MAIN_COURSE', 'STARTER': 'STARTER', 'DRINK': 'DRINK', 'DESSERT': 'DESSERT'
    };
    return mapping[value] || null;
}



// Reset-Funktion für alle Inputs
function resetProductForm() {
    document.getElementById('productName').value = '';
    document.getElementById('productDescription').value = '';
    document.getElementById('price').value = '';
    document.getElementById('mainCategory').selectedIndex = 0;
    document.getElementById('isVegetarian').checked = false;
    document.getElementById('isActive').checked = false;
    productImage.src = "../pictures/ProductAvatar.png";
    productImage.setAttribute("class", "img-fluid-initial");

    // Allergene zurücksetzen
    document.querySelectorAll('#allergen-container input[type="checkbox"]').forEach(el => el.checked = false);



    // Formularvalidierung retour setzen
    hasSubmittedForm = false;
    liveCheckFields = false;
    form.classList.remove('was-validated');

    // Erfolgsmeldung
    const msgDiv = document.getElementById('productMessage');
    if (msgDiv) {
        msgDiv.textContent = 'Produkt erfolgreich angelegt!';
        msgDiv.className = 'alert alert-success mt-3';
           }

    setTimeout(() => {
        window.location.href = 'productdetailnew.html';
    }, 2000);


}


// Save-Button Handler
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

    console.log('Produkt DTO:', productDTO);

    try {
        const result = await productService.create(productDTO);
        console.log('Produkt erfolgreich hinzugefügt!', result);
        if (tempProductPicture) {
            await fileService.uploadProductPicture(result.productId, tempProductPicture);
            console.log('ProduktBild erfolgreich gespeichert', result);
        }

        // Formular resetten + Meldung
        resetProductForm();

    } catch (error) {
        console.error('Fehler beim Hinzufügen des Produkts:', error.response?.data || error);
        const msgDiv = document.getElementById('productMessage');
        if (msgDiv) {
            msgDiv.textContent = 'Fehler beim Anlegen des Produkts!';
            msgDiv.className = 'alert alert-danger mt-3';
            msgDiv.style = 'block';
            setTimeout(() => {msgDiv.textContent = ''
                msgDiv.className = '';
                msgDiv.style = 'none';
            }, 2000);
        } else {
            alert('Fehler beim Anlegen des Produkts!');
        }
    }
}


async function handleFormSubmit(event) {
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

    if (isValid) saveFormData();

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

