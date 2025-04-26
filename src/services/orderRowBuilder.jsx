// src/services/orderRowBuilder.js

export function buildOrderRowsFromSubmission(submissionData) {
    const rows = [];
    submissionData.forEach(item => {
      const rate = parseFloat(item.rate) || 0;
      const printOnly = parseInt(item.printOnly) || 0;
      const printOnlyRate = parseFloat(item.printOnlyRate || rate) || 0;
      const circulation = parseInt(item.circulation) || 0;
  
      // Print Only row
      if (printOnly > 0) {
        rows.push({
          month: item.month,
          productType: item.productType,
          adSize: item.adSize,
          deliveryType: "Print Only",
          qty: printOnly,
          rate: printOnlyRate,
        });
      }
      // Delivery row
      if (circulation > 0) {
        rows.push({
          month: item.month,
          productType: item.productType,
          adSize: item.adSize,
          deliveryType: "Delivery",
          qty: circulation,
          rate: rate,
        });
      }
    });
    return rows;
  }
  