/* const products = [
    { name: "Bruschetta Classica", kategorie: "Vorspeise", unterkategorie: "", preis: 5.90, status: true },
    { name: "Caprese mit Mozzarella di Bufala", kategorie: "Vorspeise", unterkategorie: "", preis: 7.20, status: false },
    { name: "Antipasto Misto", kategorie: "Vorspeise", unterkategorie: "", preis: 9.80, status: false },
    { name: "Knoblauchbrot", kategorie: "Vorspeise", unterkategorie: "", preis: 3.50, status: true },
    { name: "Carpaccio vom Rind", kategorie: "Vorspeise", unterkategorie: "", preis: 11.50, status: true },
    { name: "Prosciutto e Melone", kategorie: "Vorspeise", unterkategorie: "", preis: 8.90, status: true },
    { name: "Minestrone (Gemüsesuppe)", kategorie: "Vorspeise", unterkategorie: "", preis: 5.40, status: true },
    { name: "Zuppa di Pomodoro", kategorie: "Vorspeise", unterkategorie: "", preis: 4.90, status: true },
    { name: "Pizza Margherita", kategorie: "Hauptspeise", unterkategorie: "Pizza", preis: 8.90, status: true },
    { name: "Pizza Salami", kategorie: "Hauptspeise", unterkategorie: "Pizza", preis: 10.50, status: true },
    { name: "Pizza Funghi", kategorie: "Hauptspeise", unterkategorie: "Pizza", preis: 9.80, status: false },
    { name: "Pizza Quattro Formaggi", kategorie: "Hauptspeise", unterkategorie: "Pizza", preis: 11.20, status: true },
    { name: "Pizza Diavola (scharf)", kategorie: "Hauptspeise", unterkategorie: "Pizza", preis: 11.50, status: true },
    { name: "Pizza Prosciutto", kategorie: "Hauptspeise", unterkategorie: "Pizza", preis: 10.90, status: true },
    { name: "Pizza Tonno", kategorie: "Hauptspeise", unterkategorie: "Pizza", preis: 11.00, status: true },
    { name: "Pizza Vegetaria", kategorie: "Hauptspeise", unterkategorie: "Pizza", preis: 10.20, status: false },
    { name: "Lasagne al Forno", kategorie: "Hauptspeise", unterkategorie: "Pasta", preis: 11.90, status: true },
    { name: "Spaghetti Bolognese", kategorie: "Hauptspeise", unterkategorie: "Pasta", preis: 10.50, status: true },
    { name: "Penne all’Arrabbiata", kategorie: "Hauptspeise", unterkategorie: "Pasta", preis: 9.90, status: false },
    { name: "Tagliatelle al Salmone", kategorie: "Hauptspeise", unterkategorie: "Pasta", preis: 13.20, status: true },
    { name: "Tiramisu", kategorie: "Nachspeise", unterkategorie: "", preis: 5.90, status: true },
    { name: "Panna Cotta mit Beeren", kategorie: "Nachspeise", unterkategorie: "", preis: 5.80, status: true },
    { name: "Profiteroles mit Schokosauce", kategorie: "Nachspeise", unterkategorie: "", preis: 6.20, status: true },
    { name: "Gelato Misto (3 Kugeln)", kategorie: "Nachspeise", unterkategorie: "", preis: 4.50, status: true },
    { name: "Cassata Siciliana", kategorie: "Nachspeise", unterkategorie: "", preis: 6.50, status: true },
    { name: "Nutella-Pizza (klein)", kategorie: "Nachspeise", unterkategorie: "", preis: 7.00, status: true },
    { name: "Coca-Cola 0,33l", kategorie: "Getränk", unterkategorie: "Alkoholfrei", preis: 2.80, status: true },
    { name: "Mineralwasser prickelnd 0,5l", kategorie: "Getränk", unterkategorie: "Alkoholfrei", preis: 2.50, status: true },
    { name: "Apfelsaft gespritzt 0,5l", kategorie: "Getränk", unterkategorie: "Alkoholfrei", preis: 3.20, status: true },
    { name: "Hauswein weiß 0,25l", kategorie: "Getränk", unterkategorie: "Wein", preis: 4.00, status: true },
    { name: "Moretti Bier 0,33l", kategorie: "Getränk", unterkategorie: "Bier", preis: 3.90, status: true }
]; */

$.ajax({
    url: "http://localhost:8080/products",
    method: "GET",
    success: function(data) {
        products = data;
        applyFilterAndSort();
    },
    error: function(err) {
        console.error("Fehler beim Laden der Produkte:", err);        
    }
});

let currentSort = { key: "", asc: true };

function renderProducts(list) {
    const tbody = document.getElementById("table-body");
    const cards = document.getElementById("card-container");
    tbody.innerHTML = "";
    cards.innerHTML = "";

    list.forEach(p => {
        const statusBadge = `<span class="badge ${p.isActive ? 'bg-success' : 'bg-secondary'} toggle-status" data-name="${p.productName}" role="button">${p.isActive ? 'aktiv' : 'inaktiv'}</span>`;

        // Tabelle
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${p.productName}</td>
            <td>${p.mainCategory}</td>
            <td>${p.subCategory || ''}</td>
            <td>€ ${p.price.toFixed(2)}</td>
            <td class="text-center">${statusBadge}</td>
        `;
        tbody.appendChild(row);

        // Cards
        const col = document.createElement("div");
        col.className = "col-12 col-sm-6 col-md-4";
        col.innerHTML = `
            <div class="card h-100">
                <div class="card-body p-2">
                    <p class="mb-1">${p.productName}</p>
                    <p class="mb-1">${p.mainCategory} ${p.subCategory || ''}</p>
                    <p class="mb-1">€ ${p.price.toFixed(2)}</p>
                    <p class="mb-0">${statusBadge}</p>
                </div>
            </div>
        `;
        cards.appendChild(col);
    });
}

function sortProducts(list, key, asc) {
    return [...list].sort((a, b) => {
        let va = a[key], vb = b[key];
        if (typeof va === "boolean") { va = va ? 1 : 0; vb = vb ? 1 : 0; }
        if (typeof va === "string") { va = va.toLowerCase(); vb = vb.toLowerCase(); }
        return (va > vb ? 1 : -1) * (asc ? 1 : -1);
    });
}

function applyFilterAndSort() {
    const filter = document.getElementById("filter-all").value.toLowerCase();
    const filtered = products.filter(p =>
        Object.values(p).some(val => String(val).toLowerCase().includes(filter))
    );
    const sorted = currentSort.key
        ? sortProducts(filtered, currentSort.key, currentSort.asc)
        : filtered;
    renderProducts(sorted);
}

document.getElementById("filter-all").addEventListener("input", applyFilterAndSort);
document.getElementById("sort-dropdown").addEventListener("change", e => {
    currentSort.key = e.target.value;
    currentSort.asc = true;
    applyFilterAndSort();
});
document.querySelectorAll("th.sortable").forEach(th => {
    th.addEventListener("click", () => {
        const key = th.dataset.key;
        if (currentSort.key === key) {
            currentSort.asc = !currentSort.asc;
        } else {
            currentSort = { key: key, asc: true };
        }
        applyFilterAndSort();
    });
});

// Toggle Status
document.addEventListener("click", function(e) {
    if (e.target.classList.contains("toggle-status")) {
        const name = e.target.dataset.name;
        const product = products.find(p => p.productName === name);
        if (product) product.isActive = !product.isActive;
        applyFilterAndSort();
    }
});

// Initial render
applyFilterAndSort();
