const cartItems = [
    { name: 'Pizza Margherita', price: 8.90, quantity: 2 },
    { name: 'Tiramisu', price: 5.90, quantity: 1 }
]

function formatEuro(amount) {
    return amount.toFixed(2).replace('.', ',') + ' €'
}

function renderCart() {
    const tbody = $('#cartBody')
    const totalDisplay = $('#cartTotal')
    tbody.empty()
    let total = 0

    cartItems.forEach((item, index) => {
        const totalPerItem = item.price * item.quantity
        total += totalPerItem

        const row = `
      <tr>
        <td>${item.name}</td>
        <td><input type="number" min="1" class="form-control" value="${item.quantity}" data-index="${index}" class="quantity-input"></td>
        <td>${formatEuro(item.price)}</td>
        <td>${formatEuro(totalPerItem)}</td>
        <td><button class="btn btn-outline-danger btn-sm remove-btn" data-index="${index}">Entfernen</button></td>
      </tr>
    `
        tbody.append(row)
    })

    totalDisplay.text('Gesamt: ' + formatEuro(total))
}

function updateQuantity(index, value) {
    const quantity = parseInt(value)
    if (quantity > 0) {
        cartItems[index].quantity = quantity
        renderCart()
    }
}

function removeItem(index) {
    cartItems.splice(index, 1)
    renderCart()
}

function addProduct(name, price, quantity) {
    cartItems.push({ name, price, quantity })
    renderCart()
}

$(document).ready(function () {
    renderCart()

    $('#cartBody').on('change', 'input[type="number"]', function () {
        const index = $(this).data('index')
        updateQuantity(index, $(this).val())
    })

    $('#cartBody').on('click', '.remove-btn', function () {
        const index = $(this).data('index')
        removeItem(index)
    })

    $('#addProductForm').on('submit', function (event) {
        event.preventDefault()
        const name = $('#newName').val().trim()
        const price = parseFloat($('#newPrice').val())
        const quantity = parseInt($('#newQuantity').val())
        if (name && price > 0 && quantity > 0) {
            addProduct(name, price, quantity)
            $('#newName').val('')
            $('#newPrice').val('')
            $('#newQuantity').val('')
        }
    })
})
