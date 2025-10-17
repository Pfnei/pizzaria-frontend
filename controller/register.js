'use strict';


let hasSubmittedForm= false;
let liveCheckFields = false;


initPage();

function initPage() {
    document.addEventListener('DOMContentLoaded', () => {
        const form = document.getElementById('registrationForm');
    changeEnterToTab(form);

        setupDiversDetails();
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


function setupDiversDetails() {
    const anrede = document.getElementById('anrede');
    const detailsGroup = document.getElementById('diversDetailsGroup');
    const detailsInput = document.getElementById('diversDetails');

    if (!anrede || !detailsGroup) return;

    const toggle = () => {
        if (anrede.value === 'Divers') {
            detailsGroup.style.display = 'block';
        } else {
            detailsGroup.style.display = 'none';
            if (detailsInput) {
                detailsInput.value = '';
                clearValidation(detailsInput);
            }
        }
    };

    anrede.addEventListener('change', toggle);
    toggle();
}


function validateForm() {
     let isFormValid = true;

    isFormValid =  validateStringInput('vorname', false, 3, 30) && isFormValid;
    isFormValid =  validateStringInput('nachname', false, 2, 100) && isFormValid;
    isFormValid =  validateStringInput('username',true,  5, 30) && isFormValid;
    isFormValid =  validateStringInput('email', true, 5, 100, false, false, false, true) && isFormValid;
    isFormValid =  validateStringInput('telefon', false, 7, 30) && isFormValid;
    isFormValid =  validateStringInput('passwort', true, 8, 100, true, true, true, false) && isFormValid;
    isFormValid =  checkPasswordEquality('passwort','passwortWdh' ) && isFormValid;

    const detailsGroup = document.getElementById('diversDetailsGroup');
    if (detailsGroup && detailsGroup.style.display !== 'none') {
        isFormValid = validateStringInput('diversDetails', false, 4, 30) && isFormValid;
    } else {
        const details = document.getElementById('diversDetails');
        if (details) clearValidation(details);
    }



    return isFormValid ;
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
        vorname:   () => validateStringInput('vorname', false, 3, 30),
        nachname:  () => validateStringInput('nachname', false, 2, 100),
        username:  () => validateStringInput('username',true, 5, 30),
        email:     () => validateStringInput('email', true, 5, 100, false, false, false, true),
        telefon:   () => validateStringInput('telefon', false, 7, 30, false, false, false, false),
        passwort:  () => {
            const a = validateStringInput('passwort', true, 8, 100, true, true, true, false);
            // beim Tippen im Passwort auch Gleichheit neu prüfen
            const b = checkPasswordEquality('passwort', 'passwortWdh');
            return a && b;
        },
        passwortWdh: () => checkPasswordEquality('passwort', 'passwortWdh'),
        // anrede:    () => validateSelectRequired('anrede'),
        // land:      () => validateSelectRequired('land'),
        diversDetails: () => {
            const grp = document.getElementById('diversDetailsGroup');
            if (grp && grp.style.display !== 'none') {
                return validateStringInput('diversDetails', false, 4, 30);
            } else {
                const details = document.getElementById('diversDetails');
                if (details) clearValidation(details);
                return true;
            }
        }
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
    const btn = document.querySelector('#registrationForm button[type="submit"]');
    if (btn) btn.disabled = true;

    const msg = document.getElementById('successMessage');
    if (msg) {
        msg.style.display = 'block';
    }

    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1000);
}




