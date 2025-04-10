function generateInvoice() {
    const prixMarchandise = parseFloat(document.getElementById('prixMarchandise').value) || 0;
    const remise = parseFloat(document.getElementById('remise').value) || 0;
    const escompte = parseFloat(document.getElementById('escompte').value) || 0;
    const fraisPort = parseFloat(document.getElementById('fraisPort').value) || 0;
    const tva = parseFloat(document.getElementById('tva').value) || 0;

    const montantRemise = (prixMarchandise * remise) / 100;
    const prixApresRemise = prixMarchandise - montantRemise;
    const montantEscompte = (prixApresRemise * escompte) / 100;
    const prixApresEscompte = prixApresRemise - montantEscompte;

    const totalHT = prixApresEscompte;
    const montantTVA = (totalHT * tva) / 100;
    const totalTTC = totalHT + montantTVA;
    const netAPayer = totalTTC + fraisPort;

    document.getElementById('totalHT').textContent = totalHT.toFixed(2);
    document.getElementById('totalTVA').textContent = montantTVA.toFixed(2);
    document.getElementById('totalTTC').textContent = totalTTC.toFixed(2);
    document.getElementById('netAPayer').textContent = netAPayer.toFixed(2);

    // Stocker les résultats pour l'export
    window.currentInvoice = {
        prixMarchandise,
        remise,
        escompte,
        fraisPort,
        tva,
        totalHT,
        montantTVA,
        totalTTC,
        netAPayer,
    };
}

// Fonction pour exporter en Excel
function exportToExcel() {
    if (!window.currentInvoice) {
        alert("Veuillez d'abord générer une facture avant de l'exporter.");
        return;
    }

    const invoice = window.currentInvoice;

    // Créer les données à exporter
    const data = [
        ["Détail", "Valeur"],
        ["Prix de la marchandise (€)", invoice.prixMarchandise],
        ["Remise (%)", invoice.remise],
        ["Escompte (%)", invoice.escompte],
        ["Frais de port (€)", invoice.fraisPort],
        ["TVA (%)", invoice.tva],
        ["Total HT (€)", invoice.totalHT.toFixed(2)],
        ["Montant TVA (€)", invoice.montantTVA.toFixed(2)],
        ["Total TTC (€)", invoice.totalTTC.toFixed(2)],
        ["Net à Payer (€)", invoice.netAPayer.toFixed(2)],
    ];

    // Convertir les données en une feuille Excel
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Facture");

    // Exporter le fichier
    XLSX.writeFile(workbook, "Facture.xlsx");
}