// rows: DB rows, months: months label array
export function groupRowsForEdit(rows, months) {

  return months.map(monthLabel => {
    const printOnlyRow = rows.find(r => r.MONTH === monthLabel && r.DELIVERYTYPE === "Print Only");
    const deliveryRow = rows.find(r => r.MONTH === monthLabel && r.DELIVERYTYPE !== "Print Only");
    const printOnly = printOnlyRow?.QTY || 0;
    const circulation = deliveryRow?.QTY || 0;

    return {
      productType: printOnlyRow?.PRODUCTTYPE || deliveryRow?.PRODUCTTYPE || "",
      adSize: printOnlyRow?.ADSIZE || deliveryRow?.ADSIZE || "",
      printOnly: printOnly,
      printOnlyRate: printOnlyRow?.RATE || deliveryRow?.RATE || 0,
      circulation: circulation,
      rate: deliveryRow?.RATE || printOnlyRow?.RATE || 0,
      quantity: parseInt(printOnly) + parseInt(circulation)
    };
  });
}
  