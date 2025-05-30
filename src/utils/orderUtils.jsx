import adRates from "../data/adRates.json";

export const handleTypeChange = (e, index, selectedTypes, selectedSizes, rates, setSelectedTypes, setRates) => {
  const value = e.target.value;
  const newTypes = [...selectedTypes];
  newTypes[index] = value;
  setSelectedTypes(newTypes);

  const size = selectedSizes[index];
  const newRates = [...rates]; 
  newRates[index] = value && size && adRates[value][size] ? adRates[value][size] : "";
  setRates(newRates);
};

export const handleSizeChange = (e, index, selectedSizes, selectedTypes, rates, setSelectedSizes, setRates) => {
  const value = e.target.value;
  const newSizes = [...selectedSizes];
  newSizes[index] = value;
  setSelectedSizes(newSizes);

  const type = selectedTypes[index];
  const newRates = [...rates];
  newRates[index] = type && value && adRates[type][value] ? adRates[type][value] : "";
  setRates(newRates);
};

export const handleQuantityChange = (
  e,
  index,
  quantities,
  printOnly,
  setQuantities,
  setCirculations
) => {
  const value = e.target.value;
  const newQuantities = [...quantities];
  newQuantities[index] = value;
  setQuantities(newQuantities);

  const updatedCirculations = newQuantities.map((qty, i) => {
    const q = parseInt(qty) || 0;
    const po = parseInt(printOnly[i]) || 0;
    return String(Math.max(q - po, 0));
  });
  setCirculations(updatedCirculations);
};

export const handlePrintOnlyChange = (
  e,
  index,
  quantities,
  printOnly,
  setPrintOnly,
  setCirculations
) => {
  const value = e.target.value;
  const newPrintOnly = [...printOnly];
  newPrintOnly[index] = value;
  setPrintOnly(newPrintOnly);

  const updatedCirculations = quantities.map((qty, i) => {
    const q = parseInt(qty) || 0;
    const po = parseInt(newPrintOnly[i]) || 0;
    return String(Math.max(q - po, 0));
  });
  setCirculations(updatedCirculations);
};

export const generateSubmissionData = (
  months, selectedTypes, selectedSizes, quantities, printOnly, circulations, rates, printOnlyRates
) => {
  return months.map((month, index) => {
    const type = selectedTypes[index];
    const size = selectedSizes[index];
    const quantity = parseInt(quantities[index]);
    const print = parseInt(printOnly[index]);
    const circulation = parseInt(circulations[index]);
    const rate = rates[index];
    const printOnlyRate = printOnlyRates ? printOnlyRates[index] : rate;

    if (type && size && quantity >= 1000) {
      return {
        month,
        productType: type,
        adSize: size,
        rate,
        quantity,
        printOnly: print,
        circulation,
        printOnlyRate
      };
    }
    return null;
  }).filter(Boolean);
};

export function calculateTotals(months, selectedTypes, selectedSizes, quantities, rates, printOnly, printOnlyRates, circulations) {
  let subtotal = 0;
  for (let i = 0; i < months.length; i++) {
    if (!selectedTypes[i] || !selectedSizes[i]) continue;

    const r = parseFloat(rates[i] || "0");
    const po = parseInt(printOnly[i] || "0");
    const por = parseFloat(printOnlyRates[i] || r); // fallback to rate if not set
    const circ = parseInt(circulations[i] || "0");

    if (po > 0) subtotal += po * por;
    if (circ > 0) subtotal += circ * r;
  }
  const tax = subtotal * 0.14;
  const total = subtotal + tax;
  return { subtotal, tax, total };
}