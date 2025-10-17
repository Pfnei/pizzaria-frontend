function updateTotal() {
    let total = 0;

    document.querySelectorAll('.card').forEach(card => {
        const priceElement = card.querySelector('.item-price');
        const qtyElement = card.querySelector('.d-flex.align-items-center span');

        if (!priceElement || !qtyElement) return;

        const unitPrice = parseFloat(priceElement.dataset.price.replace(',', '.'));
        const quantity = parseInt(qtyElement.innerText);

        if (!isNaN(unitPrice) && !isNaN(quantity)) {
            total += unitPrice * quantity;
        }
    });

    document.getElementById('totalPrice').innerText = '€ ' + total.toFixed(2).replace('.', ',');
}

function updateItemTotal(button, qty) {
    const card = button.closest('.card');
    const price = card.querySelector('.item-price');
    const priceXQtyFloat = qty * parseFloat(price.dataset.price.replace(',', '.'));
    card.querySelectorAll('.item-price').forEach(itemPrice => {
        itemPrice.innerText = '€ ' + priceXQtyFloat.toFixed(2).replace('.', ',');
    });
}

function removeItem(button) {
    const card = button.closest('.card');
    if (card) {
        card.remove();
        updateTotal();
    }
}

function decreaseQty(button) {
    const qtySpan = button.nextElementSibling;
    let qty = parseInt(qtySpan.innerText);
    if (qty > 0) {
        qty--;
        qtySpan.innerText = qty;
        updateItemTotal(button, qty);
        updateTotal();
    }
}

function increaseQty(button) {
    const qtySpan = button.previousElementSibling;
    let qty = parseInt(qtySpan.innerText);
    qty++;
    qtySpan.innerText = qty;
    updateItemTotal(button, qty);
    updateTotal();
}

// calculate total when site is loaded
document.addEventListener("DOMContentLoaded", updateTotal);
