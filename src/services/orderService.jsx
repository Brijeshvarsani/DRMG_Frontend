// import { buildOrderRowsFromSubmission } from "./orderRowBuilder";

// // months: array of 14 months (labels)
// // formData: the current form data for all 14 months (an array of objects per month)
// export function buildOrderPayload(selectedCustomerId, months, formData) {
//     // formData[idx] is the user's data for months[idx]
//     const rows = [];
  
//     months.forEach((monthLabel, idx) => {
//       const item = formData[idx] || {};
//       const productType = item.productType || "";
//       const adSize = item.adSize || "";
//       const printOnly = parseInt(item.printOnly) || 0;
//       const printOnlyRate = parseFloat(item.printOnlyRate || item.rate) || 0;
//       const circulation = parseInt(item.circulation) || 0;
//       const rate = parseFloat(item.rate) || 0;
  
//       // Always add Print Only row (qty may be 0)
//       rows.push({
//         Month: monthLabel,
//         ProductType: productType,
//         AdSize: adSize,
//         DeliveryType: "Print Only",
//         Qty: printOnly,
//         Rate: printOnlyRate,
//       });
//       // Always add Delivery row (qty may be 0)
//       rows.push({
//         Month: monthLabel,
//         ProductType: productType,
//         AdSize: adSize,
//         DeliveryType: "Delivery",
//         Qty: circulation,
//         Rate: rate,
//       });
//     });
  
//     return {
//       CId: selectedCustomerId,
//       ODate: new Date().toISOString().split('T')[0],
//       rows
//     };
//   }
  
// export function buildOrderPayload(orderId, customerId, months, formData) {
//     const rows = [];
//     months.forEach((monthLabel, idx) => {
//       const item = formData[idx] || {};
//       const productType = item.productType || "";
//       const adSize = item.adSize || "";
//       const printOnly = parseInt(item.printOnly) || 0;
//       const printOnlyRate = parseFloat(item.printOnlyRate || item.rate) || 0;
//       const circulation = parseInt(item.circulation) || 0;
//       const rate = parseFloat(item.rate) || 0;
//       rows.push({
//         Month: monthLabel,
//         ProductType: productType,
//         AdSize: adSize,
//         DeliveryType: "Print Only",
//         Qty: printOnly,
//         Rate: printOnlyRate,
//       });
//       rows.push({
//         Month: monthLabel,
//         ProductType: productType,
//         AdSize: adSize,
//         DeliveryType: "Delivery",
//         Qty: circulation,
//         Rate: rate,
//       });
//     });
//     return {
//       OId: orderId,
//       CId: customerId,
//       ODate: new Date().toISOString().split('T')[0],
//       rows
//     };
//   }

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
  