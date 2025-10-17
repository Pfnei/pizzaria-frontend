$(function() {
      $('#footer').load('../views/footer.html');
    });

'use strict';

let hasSubmittedForm = false;
let liveCheckFields = false;

initCheckout();

function initCheckout() {
    document.addEventListener('DOMContentLoaded', () => {
        const form = document.getElementById('deliveryForm');
        const formTotal = document.getElementById('checkoutSubmitForm');
        changeEnterToTab(form);
        formTotal.addEventListener('submit', handleFormSubmit);
        renderOrderSummary();
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
        
    }

    if (isValid) showSuccessAndRedirect();

}



function validateForm() {
    let isFormValid = true;
    isFormValid = validateStringInput('vorname', true, 2, 30) && isFormValid;
    isFormValid = validateStringInput('nachname', true, 3, 100) && isFormValid;
    isFormValid = validateStringInput('telefon', true, 7, 30) && isFormValid;
    isFormValid = validateStringInput('adresse', true, 7, 100) && isFormValid;
    isFormValid = validateStringInput('plz', true, 2, 10) && isFormValid;
    isFormValid = validateStringInput('ort', true, 1) && isFormValid;
    return isFormValid;
}


function bindLiveValidation() {
    if (liveCheckFields) return;
    liveCheckFields = true;
    const validators = {
        vorname:   () => validateStringInput('vorname', false, 3, 30),
        nachname:  () => validateStringInput('nachname', false, 2, 100),
        telefon:   () => validateStringInput('telefon', false, 7, 30),
        adresse: () => validateStringInput('adresse', true, 7, 100),
        plz:   () => validateStringInput('plz', true, 2, 10),
        ort: () => validateStringInput('ort', true, 1)
    };
    Object.keys(validators).forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        const handler = () => {
            if (!hasSubmittedForm) return;
            validators[id]();
        };
        if (el.tagName === 'SELECT') {
            el.addEventListener('change', handler);
        } else {
            el.addEventListener('input', handler);
            el.addEventListener('blur', handler);
        }
    });
}


function showSuccessAndDisable() {
    const btn = document.querySelector('#checkoutSubmitForm button[type="submit"]');
    if (btn) btn.disabled = true;
    const msg = document.getElementById('successMessage');
    if (msg) msg.style.display = 'block';
    /*/setTimeout(() => {
        window.location.href = 'login.html';
    }, 1000);*/
}



const orderItems = [
    { name: 'Product name', quantity: 1, price: 12 },
    { name: 'Second product', quantity: 1, price: 8 },
    { name: 'Third item', quantity: 1, price: 5 }
]

function formatEuro(value) {
    return '€' + value.toFixed(2).replace('.', ',')
}

function renderOrderSummary() {
    const tbody = $('#orderSummary')
    tbody.empty()
    let total = 0
    orderItems.forEach(item => {
        const itemTotal = item.price * item.quantity
        total += itemTotal
        const row = `
      <tr>
        <td>${item.name}</td>
        <td class="text-center">${item.quantity}</td>
        <td class="text-end">${formatEuro(item.price)}</td>
      </tr>
    `
        tbody.append(row)
    })
    const totalRow = `
    <tr>
      <th colspan="2">Gesamt (EURO)</th>
      <th class="text-end">${formatEuro(total)}</th>
    </tr>
  `
    tbody.append(totalRow)
}

