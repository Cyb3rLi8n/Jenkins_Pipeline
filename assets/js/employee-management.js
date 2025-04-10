let employeeData = []; // Contient les données brutes des employés

// Charger les données au démarrage
document.addEventListener('DOMContentLoaded', loadEmployeeData);

async function loadEmployeeData() {
    try {
        const response = await fetch('data/employe_data.json'); // Assurez-vous que ce chemin est correct
        const jsonData = await response.json();
        
        // Vérifiez si les données sont structurées comme prévu
        employeeData = jsonData.Employes || [];
        console.log("Données des employés chargées :", employeeData);

        // Appliquer les filtres au démarrage
        applyFilters();
    } catch (error) {
        console.error("Erreur lors du chargement des données :", error);
    }
}

// Appliquer les filtres et la recherche
function applyFilters() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const filterSexe = document.getElementById('filterSexe').value;
    const filterQualification = document.getElementById('filterQualification').value;
    const filterSite = document.getElementById('filterSite').value;

    // Filtrer les employés
    const filteredData = employeeData.filter(employee => {
        const matchesSearch = (
            String(employee["ID Salarie"]).toLowerCase().includes(query) || 
            String(employee["Nom"]).toLowerCase().includes(query) ||
            String(employee["Prenom"]).toLowerCase().includes(query)
        );
        const matchesSexe = filterSexe === "" || employee["Sexe"] === filterSexe;
        const matchesQualification = filterQualification === "" || employee["Qualification"] === filterQualification;
        const matchesSite = filterSite === "" || employee["Site"] === filterSite;

        return matchesSearch && matchesSexe && matchesQualification && matchesSite;
    });

    // Mettre à jour le tableau et les totaux
    displaySearchResults(filteredData);
    updateSummary(filteredData);
}

function displaySearchResults(results) {
    const resultsTable = document.getElementById('employeeResults');
    resultsTable.innerHTML = '';

    if (!Array.isArray(results)) {
        console.error("Les résultats fournis ne sont pas valides.");
        return;
    }

    // Trouver les valeurs min et max pour les heures d'absence
    const maxAbsence = Math.max(...results.map(employee => employee["Heures absence"] || 0));
    const minAbsence = Math.min(...results.map(employee => employee["Heures absence"] || 0));

    results.forEach(employee => {
        const absence = employee["Heures absence"] || 0;

        // Calculer l'intensité de la couleur (0 = vert, 1 = rouge)
        const intensity = (absence - minAbsence) / (maxAbsence - minAbsence || 1);
        const red = Math.round(255 * intensity);
        const green = Math.round(255 * (1 - intensity));
        const backgroundColor = `rgb(${red}, ${green}, 0)`; // Dégradé vert à rouge

        const row = `
            <tr>
                <td>${employee["ID Salarie"] || "-"}</td>
                <td>${employee["Nom"] || "-"}</td>
                <td>${employee["Prenom"] || "-"}</td>
                <td>${employee["Sexe"] || "-"}</td>
                <td>${employee["Age"] || "-"}</td>
                <td>${employee["Date integration"] || "-"}</td>
                <td>${employee["Qualification"] || "-"}</td>
                <td>${employee["Site"] || "-"}</td>
                <td>${employee["Salaire brut"] || "-"}</td>
                <td style="background-color: ${backgroundColor}; color: white;">
                    ${absence}
                </td>
            </tr>
        `;
        resultsTable.innerHTML += row;
    });

    if (results.length === 0) {
        resultsTable.innerHTML = '<tr><td colspan="10">Aucun employé trouvé.</td></tr>';
    }
}


// Mettre à jour le résumé des données filtrées
function updateSummary(filteredData) {
    const totalEmployees = filteredData.length;
    const averageAge = filteredData.reduce((sum, employee) => sum + (employee["Age"] || 0), 0) / totalEmployees || 0;
    const averageSalary = filteredData.reduce((sum, employee) => sum + (employee["Salaire brut"] || 0), 0)  / totalEmployees || 0;
    const totalAbsence = filteredData.reduce((sum, employee) => sum + (employee["Heures absence"] || 0), 0);

    document.getElementById('totalEmployees').textContent = totalEmployees;
    document.getElementById('averageAge').textContent = averageAge.toFixed(2);
    document.getElementById('averageSalary').textContent = averageSalary.toFixed(2);
    document.getElementById('totalAbsence').textContent = totalAbsence.toFixed(2);
}