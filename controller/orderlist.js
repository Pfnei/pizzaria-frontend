const orders = [
    { datum: "01.03.2024", summe: 116.40, benutzername: "clarkzod", vorname: "Hannah", nachname: "Bukovec", email: "Hannah.Bukovec@muster.at", plz: "4020" },
    { datum: "12.04.2024", summe: 46.80, benutzername: "brucefox", vorname: "Paul", nachname: "Pfischer", email: "Paul.Pfischer@muster.at", plz: "8010" },
    { datum: "07.06.2024", summe: 104.40, benutzername: "diana91", vorname: "Sophie", nachname: "Schmid", email: "Sophie.Schmid@muster.at", plz: "5020" },
    { datum: "19.07.2024", summe: 115.70, benutzername: "loganx", vorname: "Tobias", nachname: "Maier", email: "Tobias.Maier@muster.at", plz: "2700" },
    { datum: "23.08.2024", summe: 54.30, benutzername: "", vorname: "Anna", nachname: "Alang", email: "", plz: "6850" },
    { datum: "30.09.2024", summe: 30.20, benutzername: "parjord", vorname: "Nico", nachname: "Hofer", email: "Nico.Hofer@muster.at", plz: "4400" },
    { datum: "10.11.2024", summe: 115.00, benutzername: "barryv", vorname: "Lisa", nachname: "Gruber", email: "Lisa.Gruber@muster.at", plz: "9500" },
    { datum: "05.01.2025", summe: 68.90, benutzername: "reeddoc", vorname: "David", nachname: "Zuccatto", email: "David.Zuccatto@muster.at", plz: "3430" },
    { datum: "22.01.2025", summe: 34.70, benutzername: "", vorname: "Katharina", nachname: "Baumhackl", email: "", plz: "3100" },
    { datum: "14.02.2025", summe: 133.90, benutzername: "", vorname: "Raphael", nachname: "Müller", email: "", plz: "7000" },
    { datum: "01.03.2025", summe: 82.40, benutzername: "", vorname: "Theresa", nachname: "Chang", email: "", plz: "1190" },
    { datum: "28.03.2025", summe: 119.10, benutzername: "natroma", vorname: "Simon", nachname: "Schuster", email: "Simon.Schuster@muster.at", plz: "9560" },
    { datum: "10.04.2025", summe: 46.60, benutzername: "bamwayne", vorname: "Nina", nachname: "Wiener", email: "Nina.Wiener@muster.at", plz: "2500" },
];

let currentSort = { key: "", asc: true };

function render(list) {
    const tbody = document.getElementById("table-body");
    const cards = document.getElementById("card-container");
    tbody.innerHTML = "";
    cards.innerHTML = "";

    list.forEach(o => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${o.datum}</td>
            <td>€ ${o.summe.toFixed(2)}</td>
            <td>${o.benutzername}</td>
            <td>${o.vorname}</td>
            <td>${o.nachname}</td>
            <td>${o.email}</td>
            <td>${o.plz}</td>
        `;
        tbody.appendChild(row);

        const card = document.createElement("div");
        card.className = "col-12 col-sm-6 col-md-4";
        card.innerHTML = `
            <div class="card h-100">
                <div class="card-body p-2">
                    <p class="mb-1">${o.datum}</p>
                    <p class="mb-1">€ ${o.summe.toFixed(2)}</p>
                    <p class="mb-1">${o.vorname} ${o.nachname}</p>
                    <p class="mb-1">${o.email}</p>
                    <p class="mb-1">PLZ: ${o.plz}</p>
                </div>
            </div>
        `;
        cards.appendChild(card);
    });
}

function sort(list, key, asc) {
    return [...list].sort((a, b) => {
        let va = a[key], vb = b[key];
        if (typeof va === "string") {
            va = va.toLowerCase(); vb = vb.toLowerCase();
        }
        return (va > vb ? 1 : -1) * (asc ? 1 : -1);
    });
}

function applyFilterAndSort() {
    const filter = document.getElementById("filter-all").value.toLowerCase();
    const filtered = orders.filter(o =>
        Object.values(o).some(val =>
            String(val).toLowerCase().includes(filter)
        )
    );
    const sorted = currentSort.key ? sort(filtered, currentSort.key, currentSort.asc) : filtered;
    render(sorted);
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
applyFilterAndSort();
