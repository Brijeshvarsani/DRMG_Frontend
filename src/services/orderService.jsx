export function buildOrderPayload(
    customerId,     // CId
    months,
    selectedTypes,
    selectedSizes,
    quantities,
    printOnly,
    circulations,
    rates,
    printOnlyRates
  ) {
    const rows = [];
    months.forEach((monthLabel, idx) => {
      const productType = selectedTypes[idx] || "";
      const adSize = selectedSizes[idx] || "";
      const print = parseInt(printOnly[idx]) || 0;
      const printRate = printOnlyRates ? parseFloat(printOnlyRates[idx] || rates[idx]) || 0 : parseFloat(rates[idx]) || 0;
      const circulation = parseInt(circulations[idx]) || 0;
      const rate = parseFloat(rates[idx]) || 0;
  
      rows.push({
        Month: monthLabel,
        ProductType: productType,
        AdSize: adSize,
        DeliveryType: "Print Only",
        Qty: print,
        Rate: printRate,
      });
      rows.push({
        Month: monthLabel,
        ProductType: productType,
        AdSize: adSize,
        DeliveryType: "Delivery",
        Qty: circulation,
        Rate: rate,
      });
    });
    return {
      CId: customerId,
      ODate: new Date().toISOString().split('T')[0],
      rows
    };
  }
  