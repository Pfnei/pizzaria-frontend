'use strict';


function validateStringInput(
    fieldId,
    isRequired = true,
    min,
    max,
    needsSpecial = false,
    needsCapLetter = false,
    needsSmallLetter = false,
    isEmail = false
) {
    const element = document.getElementById(fieldId);
    if (!element) return true;
    const value = element.value.trim();
    let messages = [];

    if (!isRequired && value.length === 0) {
        clearValidation(element);
        return true;
    }

    if (min !== undefined && value.length < min) {
        messages.push(`Mindestens ${min} Zeichen erforderlich.`);
    }

    if (max !== undefined && value.length > max) {
        messages.push(`Maximal ${max} Zeichen erlaubt.`);
    }

    if (needsSpecial) {
        const specialRegex = /[!@#$%^&*(),.?":{}|<>]/;
        if (!specialRegex.test(value)) {
            messages.push("Mindestens ein Sonderzeichen erforderlich.");
        }
    }

    if (needsCapLetter) {
        const capRegex = /[A-Z]/;
        if (!capRegex.test(value)) {
            messages.push("Mindestens ein Großbuchstabe erforderlich.");
        }
    }

    if (needsSmallLetter) {
        const smallRegex = /[a-z]/;
        if (!smallRegex.test(value)) {
            messages.push("Mindestens ein Kleinbuchstabe erforderlich.");
        }
    }
    if (isEmail) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            messages.push("Keine gültige Email-Adresse");
        }
    }

    if (messages.length > 0) {
        showInvalidFeedback(element, messages.join("\n"));
        console.log("Validation false", element , messages)
        return false;
    } else {
        clearValidation(element);
        return true;
    }
}


function checkPasswordEquality(fieldIdInitial, fieldIdRepetition) {
    const element1 = document.getElementById(fieldIdInitial);
    const value1 = element1.value.trim();
    let messages = [];
    const element2 = document.getElementById(fieldIdRepetition);
    const value2 = element2.value.trim();

    if (value1 !== value2) {
        messages.push(`Die Passwörter sind nicht gleich.`);
    }

    if (messages.length > 0) {
        showInvalidFeedback(element2,  messages.join("\n"));
        console.log("Validation false", element2 , messages)
        return false;
    } else {
        clearValidation(element2);
        return true;
    }
}

function validateNotEmpty(fieldId) {
    const element = document.getElementById(fieldId);
    if (!element) return true;
    const value = element.value.trim();
    let messages = [];

    if (value.length === 0) {
        messages.push("Dieses Feld darf nicht leer sein.");
    }

    if (messages.length > 0) {
        showInvalidFeedback(element, messages.join("\n"));
        console.log("Validation false", element, messages);
        return false;
    } else {
        clearValidation(element);
        return true;
    }
}

function validateNumeric(fieldId, isRequired = true) {
    const element = document.getElementById(fieldId);
    if (!element) return true;
    const raw = element.value.trim();
    let messages = [];

    if (!isRequired && raw.length === 0) {
        clearValidation(element);
        return true;
    }

    if (raw.length === 0) {
        messages.push("Dieses Feld darf nicht leer sein.");
    } else {
        const numericRegex = /^-?\d+(?:[.,]\d+)?$/;
        if (!numericRegex.test(raw)) {
            messages.push("Keine gültige Zahl.");
        }
    }

    if (messages.length > 0) {
        showInvalidFeedback(element, messages.join("\n"));
        console.log("Validation false", element, messages);
        return false;
    } else {
        clearValidation(element);
        return true;
    }
}

function validateSelect(fieldId, isRequired = true) {
    const element = document.getElementById(fieldId);
    if (!element) return true;
    const value = (element.value || "").trim();
    let messages = [];

    if (!isRequired && value.length === 0) {
        clearValidation(element);
        return true;
    }

    if (value.length === 0) {
        messages.push("Bitte eine Auswahl treffen.");
    }

    if (messages.length > 0) {
        showInvalidFeedback(element, messages.join("\n"));
        console.log("Validation false", element, messages);
        return false;
    } else {
        clearValidation(element);
        return true;
    }
}



function clearValidation(field) {
    field.classList.remove('is-valid', 'is-invalid');
    const feedback = field.parentElement.querySelector('.validation-feedback-ok, .validation-feedback-nok');
    if (feedback) {
        feedback.textContent = '';
        feedback.classList.remove('validation-feedback-nok');
        feedback.classList.add('validation-feedback-ok');
    }
}


function showInvalidFeedback(field, message) {
    field.classList.remove('is-valid');
    field.classList.add('is-invalid');
    const feedback = field.parentElement.querySelector('.validation-feedback-ok, .validation-feedback-nok');
    if (feedback) {
        feedback.textContent = message;
        feedback.classList.remove('validation-feedback-ok');
        feedback.classList.add('validation-feedback-nok');
    }
}

