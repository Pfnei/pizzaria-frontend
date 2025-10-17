$(function () {
    $('#footer').load('../views/footer.html');
});

'use strict';


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
    const btn = document.querySelector('#userForm button[type="submit"]');
    if (btn) btn.disabled = true;

    const msg = document.getElementById('successMessage');
    if (msg) {
        msg.style.display = 'block';
    }

    /*/setTimeout(() => {
          window.location.href = 'login.html';
      }, 1000);*/
}
