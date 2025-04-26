import React, { useState } from "react";
import adSizes from "../data/adSizes.json";
import productTypes from "../data/productTypes.json";
import { getMonthLabels } from "../utils/dateUtils";
import {
  handleTypeChange,
  handleSizeChange,
  handleQuantityChange,
  handlePrintOnlyChange,
  generateSubmissionData,
  calculateTotals
} from "../utils/orderUtils";
import { saveOrder } from "../api/order"
import { buildOrderPayload } from "../services/orderService";
import { fetchOrderAndGeneratePDF } from "../services/invoiceService";
import CustomerSection from "./CustomerSection";

export default function OrderTable() {

  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [customerForm, setCustomerForm] = useState({
    CCOMPANY: "",
    CNAME: "",
    CEMAIL: "",
    CNUMBER: "",
    CSTREET: "",
    CCITY: "",
    CPOSTALCODE: "",
    CPROVINCE: "",
  });
  

  const months = getMonthLabels();
  const [selectedTypes, setSelectedTypes] = useState(Array(14).fill(""));
  const [selectedSizes, setSelectedSizes] = useState(Array(14).fill(""));
  const [rates, setRates] = useState(Array(14).fill(""));
  const [quantities, setQuantities] = useState(Array(14).fill("0"));
  const [printOnly, setPrintOnly] = useState(Array(14).fill("0"));
  const [circulations, setCirculations] = useState(Array(14).fill("0"));
  const [printOnlyEnabled, setPrintOnlyEnabled] = useState(Array(14).fill(false));
  const [printOnlyRates, setPrintOnlyRates] = useState(Array(14).fill(""));

  const handlePrintOnlyCheckbox = (idx, checked) => {
    setPrintOnlyEnabled(enabledArr => {
      const newArr = [...enabledArr];
      newArr[idx] = checked;
      return newArr;
    });
    setPrintOnly(poArr => {
      const newArr = [...poArr];
      if (!checked) newArr[idx] = "0";
      return newArr;
    });
    setPrintOnlyRates(porArr => {
      const newArr = [...porArr];
      if (checked && !porArr[idx]) {
        newArr[idx] = rates[idx]; // default to rate if not already set
      }
      if (!checked) newArr[idx] = "";
      return newArr;
    });
    setCirculations(circArr => {
      const newArr = [...circArr];
      if (!checked) newArr[idx] = quantities[idx];
      return newArr;
    });
  };
  
  const handleSubmit = async () => {
    // ... your validation code ...
  
      const submissionData = generateSubmissionData(
        months,
        selectedTypes,
        selectedSizes,
        quantities,
        printOnly,
        circulations,
        rates,
        printOnlyRates
      );
  
    if (submissionData.length === 0) {
      alert("At least one valid month entry is required before submitting.");
      return;
    }
  
    // Now build payload with all months and submissionData
    const orderPayload = buildOrderPayload(
      selectedCustomerId,
      months,
      selectedTypes,
      selectedSizes,
      quantities,
      printOnly,
      circulations,
      rates,
      printOnlyRates
    );    
  
    try {
      const result = await saveOrder(orderPayload);
      alert("Order saved! Order ID: " + result.OId);
  
      // For the PDF, filter only rows where qty > 0 (for a clean invoice)
      fetchOrderAndGeneratePDF(result.OId);
  
    } catch (err) {
      alert("Failed to save order");
      console.error(err);
    }
  };

  const { subtotal, tax, total } = calculateTotals(
    months, selectedTypes, selectedSizes, quantities, rates, printOnly, printOnlyRates, circulations
  );
  
  return (
    <div className="container py-4">

      <CustomerSection
        selectedCustomerId={selectedCustomerId}
        setSelectedCustomerId={setSelectedCustomerId}
        customerForm={customerForm}
        setCustomerForm={setCustomerForm}
        setIsNewCustomer={setIsNewCustomer}
      />

      <h2 className="mb-4 text-center">Monthly Order Form</h2>
      <div className="table-responsive">
        <table className="table table-bordered table-sm text-center align-middle small custom-table">
          <thead>
            <tr>
              <th className="text-start">MAILING</th>
              {months.map((month, idx) => (
                <th key={idx}>{month}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="text-start fw-bold">PRODUCT TYPE</td>
              {months.map((_, idx) => (
                <td key={idx}>
                  <select
                    value={selectedTypes[idx]}
                    onChange={e => {
                      const value = e.target.value;
                      handleTypeChange(e, idx, selectedTypes, selectedSizes, rates, setSelectedTypes, setRates);
                      if (!value) {
                        // When Product Type is set to default, also reset Ad Size for that month
                        setSelectedSizes(sizes => {
                          const arr = [...sizes];
                          arr[idx] = "";
                          return arr;
                        });
                        // Ad Size reset will cascade and trigger your previous reset logic!
                        setQuantities(q => {
                          const arr = [...q];
                          arr[idx] = "";
                          return arr;
                        });
                        setPrintOnlyEnabled(poEnabled => {
                          const arr = [...poEnabled];
                          arr[idx] = false;
                          return arr;
                        });
                        setPrintOnly(po => {
                          const arr = [...po];
                          arr[idx] = "0";
                          return arr;
                        });
                        setCirculations(circ => {
                          const arr = [...circ];
                          arr[idx] = "0";
                          return arr;
                        });
                      }
                    }}
                    className="form-select form-select-sm"
                  >
                    {productTypes.map((type, index) => (
                      <option key={index} value={type}>{type}</option>
                    ))}
                  </select>
                </td>
              ))}
            </tr>
            <tr>
              <td className="text-start fw-bold">AD SIZE</td>
              {months.map((_, idx) => (
                <td key={idx}>
                  <select
                    value={selectedSizes[idx]}
                    onChange={e => {
                      const value = e.target.value;
                      handleSizeChange(e, idx, selectedSizes, selectedTypes, rates, setSelectedSizes, setRates);
                      if (!value) {
                        setQuantities(q => {
                          const arr = [...q];
                          arr[idx] = "";
                          return arr;
                        });
                        setPrintOnlyEnabled(poEnabled => {
                          const arr = [...poEnabled];
                          arr[idx] = false;
                          return arr;
                        });
                        setPrintOnly(po => {
                          const arr = [...po];
                          arr[idx] = "0";
                          return arr;
                        });
                        setCirculations(circ => {
                          const arr = [...circ];
                          arr[idx] = "0";
                          return arr;
                        });
                      }
                    }}

                    className="form-select form-select-sm"
                    disabled={!selectedTypes[idx]}
                  >
                    {adSizes.map((size, index) => (
                      <option key={index} value={size}>{size}</option>
                    ))}
                  </select>
                </td>
              ))}
            </tr>
            <tr>
              <td className="text-start fw-bold">RATE</td>
              {months.map((_, idx) => (
                <td key={idx}>
                  <input
                    type="text"
                    inputMode="decimal"
                    pattern="[0-9]*[.]?[0-9]*"
                    value={rates[idx]}
                    onChange={(e) => {
                      const newRates = [...rates];
                      newRates[idx] = e.target.value;
                      setRates(newRates);
                    }}
                    className="form-control form-control-sm"
                    disabled={!selectedSizes[idx] || !selectedTypes[idx]}
                    style={{ MozAppearance: 'textfield' }}
                  />
                </td>
              ))}
            </tr>
            <tr>
              <td className="text-start fw-bold">QUANTITY</td>
              {months.map((_, idx) => (
                <td key={idx}>
                  <input
                    type="number"
                    min="0"
                    value={quantities[idx]}
                    onChange={(e) => handleQuantityChange(e, idx, quantities, printOnly, setQuantities, setCirculations)}
                    className="form-control form-control-sm"
                    disabled={!selectedSizes[idx]}
                  />
                </td>
              ))}
            </tr>
            {/* UPDATED PRINT ONLY ROW */}
            <tr>
              <td className="text-start fw-bold">PRINT ONLY</td>
              {months.map((_, idx) => (
                <td key={idx}>
                  <div className="d-flex justify-content-center align-items-center">
                    <input
                      type="checkbox"
                      checked={printOnlyEnabled[idx]}
                      onChange={e => handlePrintOnlyCheckbox(idx, e.target.checked)}
                      disabled={quantities[idx] === "" || quantities[idx] === "0"}
                    />
                    {printOnlyEnabled[idx] ? (
                      <input
                        type="number"
                        min="0"
                        value={printOnly[idx]}
                        onChange={e => handlePrintOnlyChange(e, idx, quantities, printOnly, setPrintOnly, setCirculations)}
                        className="form-control form-control-sm ms-2"
                        style={{ width: "80px" }}
                      />
                    ) : (
                      <span className="ms-2 text-muted">0</span>
                    )}
                  </div>
                </td>
              ))}
            </tr>
            <tr>
              <td className="text-start fw-bold">PRINT ONLY RATE</td>
              {months.map((_, idx) => (
                <td key={idx}>
                  {printOnlyEnabled[idx] ? (
                    <input
                      type="text"
                      inputMode="decimal"
                      pattern="[0-9]*[.]?[0-9]*"
                      value={printOnlyRates[idx]}
                      onChange={e => {
                        const newRates = [...printOnlyRates];
                        newRates[idx] = e.target.value;
                        setPrintOnlyRates(newRates);
                      }}
                      className="form-control form-control-sm"
                      style={{ width: "80px" }}
                    />
                  ) : (
                    <span className="ms-2 text-muted">-</span>
                  )}
                </td>
              ))}
            </tr>

            <tr>
              <td className="text-start fw-bold">CIRCULATION</td>
              {months.map((_, idx) => (
                <td key={idx}>{circulations[idx]}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <div className="text-end mb-3 me-2">
        <p><strong>Subtotal:</strong> ${subtotal.toFixed(2)}</p>
        <p><strong>Tax (15%):</strong> ${tax.toFixed(2)}</p>
        <p><strong>Total:</strong> ${total.toFixed(2)}</p>
      </div>
      <div className="text-end mt-3">
        <button className="btn btn-primary" onClick={handleSubmit}>Submit Order</button>
      </div>
    </div>
  );
}
