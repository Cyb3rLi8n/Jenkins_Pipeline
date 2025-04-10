function calculateStock() {
    const productName = document.getElementById('productName').value;
    const salePrice = parseInt(document.getElementById('salePrice').value) || 0;
    const initialStock = parseInt(document.getElementById('initialStock').value) || 0;
    const purchases = parseInt(document.getElementById('purchases').value) || 0;
    const sales = parseInt(document.getElementById('sales').value) || 0;

    const remainingStock = initialStock + purchases - sales;
    const income = sales * sellPrice - sales;

    const stockResult = document.getElementById('stockResult');
    const incomeResult = document.getElementById('incomeResult');

    if (remainingStock < 0) {
        stockResult.textContent = `Erreur : Le stock ne peut pas être négatif. Veuillez vérifier vos données.`;
        stockResult.style.color = 'red';
    } else {
        stockResult.textContent = `Le stock restant pour "${productName}" est de ${remainingStock}.`;
        stockResult.style.color = 'green';
    }
}

/// Liste des stocks pour stocker les données temporairement
let stockList = [];

// Charger les données depuis le backend
async function loadFromBackend() {
    try {
        const response = await fetch('http://localhost:3000/stocks');
        stockList = await response.json();
        updateStockTable();
        updateSummary();
    } catch (error) {
        console.error('Erreur lors du chargement des données :', error);
    }
}

// Ajouter une nouvelle entrée dans le backend
async function addStockToBackend(entry) {
    try {
        await fetch('http://localhost:3000/stocks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(entry),
        });
        loadFromBackend(); // Recharger les données après ajout
    } catch (error) {
        console.error('Erreur lors de l\'ajout des données :', error);
    }
}

// Ajouter une entrée depuis le formulaire
function addStockEntry() {
    const productName = document.getElementById('productName').value;
    const initialStock = parseInt(document.getElementById('initialStock').value) || 0;
    const purchases = parseInt(document.getElementById('purchases').value) || 0;
    const sales = parseInt(document.getElementById('sales').value) || 0;
    const price = parseFloat(document.getElementById('price').value) || 0;

    const remainingStock = initialStock + purchases - sales;
    if (remainingStock < 0) {
        alert("Erreur : Le stock restant ne peut pas être négatif !");
        return;
    }

    const revenue = sales * price;
    const newEntry = { productName, initialStock, purchases, sales, price, revenue, remainingStock };

    addStockToBackend(newEntry); // Enregistrer via l'API
    document.getElementById('stockForm').reset();
}

// Charger les données au démarrage
loadFromBackend();

function updateStockTable() {
    const stockBody = document.getElementById('stockBody');
    stockBody.innerHTML = ''; // Effacer les anciennes lignes

    stockList.forEach((item, index) => {
        const row = `
            <tr>
                <td>${item.productName}</td>
                <td>${item.initialStock}</td>
                <td>${item.purchases}</td>
                <td>${item.sales}</td>
                <td>${item.price.toFixed(2)} €</td>
                <td>${item.revenue.toFixed(2)} €</td>
                <td>${item.remainingStock}</td>
                <td>
                    <button onclick="editRow(${index})">Modifier</button>
                    <button onclick="deleteRow(${index})">Supprimer</button>
                </td>
            </tr>
        `;
        stockBody.innerHTML += row; // Ajouter chaque ligne au tableau
    });
}

async function deleteRow(index) {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette entrée ?")) {
        try {
            await fetch(`http://localhost:3000/stocks/${index}`, {
                method: 'DELETE',
            });
            loadFromBackend().then(() => {
                updateSummary();
            });
        } catch (error) {
            console.error('Erreur lors de la suppression de l\'entrée :', error);
        }
    }
}

function editRow(index) {
    const item = stockList[index];

    // Pré-remplir le formulaire avec les données existantes
    document.getElementById('productName').value = item.productName;
    document.getElementById('initialStock').value = item.initialStock;
    document.getElementById('purchases').value = item.purchases;
    document.getElementById('sales').value = item.sales;
    document.getElementById('price').value = item.price;

    // Ajouter un bouton pour enregistrer les modifications
    const saveButton = document.createElement('button');
    saveButton.textContent = "Enregistrer";
    saveButton.onclick = function () {
        saveEditedRow(index); // Passer l'index à la fonction de sauvegarde
        saveButton.remove();  // Supprimer le bouton après sauvegarde
    };

    document.getElementById('stockForm').appendChild(saveButton);
}

async function saveEditedRow(index) {
    const productName = document.getElementById('productName').value;
    const initialStock = parseInt(document.getElementById('initialStock').value) || 0;
    const purchases = parseInt(document.getElementById('purchases').value) || 0;
    const sales = parseInt(document.getElementById('sales').value) || 0;
    const price = parseFloat(document.getElementById('price').value) || 0;

    const remainingStock = initialStock + purchases - sales;
    if (remainingStock < 0) {
        alert("Erreur : Le stock restant ne peut pas être négatif !");
        return;
    }

    const revenue = sales * price;

    const updatedEntry = {
        productName,
        initialStock,
        purchases,
        sales,
        price,
        revenue,
        remainingStock,
    };

    try {
        await fetch(`http://localhost:3000/stocks/${index}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedEntry),
        });

        loadFromBackend().then(() => {
            updateSummary();
        });
        document.getElementById('stockForm').reset();
    } catch (error) {
        console.error('Erreur lors de la mise à jour des données :', error);
    }
}

function updateSummary() {
    // Calculer les totaux
    const totalPurchases = stockList.reduce((sum, item) => sum + item.purchases, 0);
    const totalSales = stockList.reduce((sum, item) => sum + item.sales, 0);
    const totalRevenue = stockList.reduce((sum, item) => sum + item.revenue, 0);
    const averagePrice =
        stockList.length > 0
            ? stockList.reduce((sum, item) => sum + item.price, 0) / stockList.length
            : 0;

    // Mettre à jour les valeurs dans le tableau
    document.getElementById('totalPurchases').textContent = totalPurchases;
    document.getElementById('totalSales').textContent = totalSales;
    document.getElementById('totalRevenue').textContent = `${totalRevenue.toFixed(2)} €`;
    document.getElementById('averagePrice').textContent = `${averagePrice.toFixed(2)} €`;
}

let companyList = []; // Liste des entreprises

function addCompany() {
    const companyName = document.getElementById('companyName').value;
    const companyRevenue = parseFloat(document.getElementById('companyRevenue').value);

    if (!companyName || companyRevenue <= 0) {
        alert("Veuillez saisir un nom et un chiffre d'affaires valide.");
        return;
    }

    companyList.push({ name: companyName, revenue: companyRevenue });

    document.getElementById('marketForm').reset(); // Réinitialiser le formulaire
    updateMarketTable(); // Mettre à jour le tableau
    updateMarketChart(); // Mettre à jour le graphique
}

function updateMarketTable() {
    const totalRevenue = companyList.reduce((sum, company) => sum + company.revenue, 0);
    const marketBody = document.getElementById('marketBody');
    marketBody.innerHTML = ''; // Réinitialiser le tableau

    companyList.forEach(company => {
        const marketShare = ((company.revenue / totalRevenue) * 100).toFixed(2); // Calcul de la part de marché
        const row = `
            <tr>
                <td>${company.name}</td>
                <td>${company.revenue.toFixed(2)} €</td>
                <td>${marketShare} %</td>
            </tr>
        `;
        marketBody.innerHTML += row;
    });
}

let marketChart;

function updateMarketChart() {
    const ctx = document.getElementById('marketChart').getContext('2d');

    // Si un graphique existe déjà, le détruire avant de le recréer
    if (marketChart) {
        marketChart.destroy();
    }

    const labels = companyList.map(company => company.name);
    const data = companyList.map(company => company.revenue);

    marketChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                label: 'Part de Marché',
                data: data,
                backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0',
                    '#9966FF',
                    '#FF9F40'
                ],
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const totalRevenue = data.reduce((sum, value) => sum + value, 0);
                            const percentage = ((context.raw / totalRevenue) * 100).toFixed(2);
                            return `${context.label}: ${context.raw.toFixed(2)} € (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}
