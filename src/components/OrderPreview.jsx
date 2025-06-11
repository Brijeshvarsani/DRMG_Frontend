import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { saveOrder } from "../api/order";
import { buildOrderPayload } from "../services/orderService";
import { fetchOrderAndGeneratePDF } from "../services/invoiceService";
import { calculateTotals } from "../utils/orderUtils";

export default function OrderPreview() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const {
    selectedCustomerId,
    customerForm,
    isNewCustomer,
    months,
    selectedTypes,
    selectedSizes,
    quantities,
    printOnly,
    circulations,
    rates,
    printOnlyRates,
    regionSelections,
    user,
    taxPercentage,
    notes,
  } = state;

  const { subtotal, tax, total } = calculateTotals(
    months,
    selectedTypes,
    selectedSizes,
    quantities,
    rates,
    printOnly,
    printOnlyRates,
    circulations,
    taxPercentage
  );

  const handleFinalSubmit = async () => {
    const payload = buildOrderPayload(
      selectedCustomerId,
      months,
      selectedTypes,
      selectedSizes,
      quantities,
      printOnly,
      circulations,
      rates,
      printOnlyRates,
      notes
    );

    payload.regionSelections = regionSelections;
    payload.months = months;
    payload.userId = user?.id;

    try {
      const result = await saveOrder(payload);
      await fetchOrderAndGeneratePDF(result.OId);
      alert("Order submitted!");
      navigate("/order-list");
    } catch (err) {
      alert("Failed to submit order.");
      console.error(err);
    }
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4">Order Preview</h2>

      <div className="card mb-3 p-3">
        <h5>Customer Info</h5>
        <p><strong>Company:</strong> {customerForm.CCOMPANY}</p>
        <p><strong>Name:</strong> {customerForm.CNAME}</p>
        <p><strong>Email:</strong> {customerForm.CEMAIL}</p>
        <p><strong>Phone:</strong> {customerForm.CNUMBER}</p>
        <p><strong>Address:</strong> {customerForm.CSTREET}, {customerForm.CCITY}, {customerForm.CPROVINCE}, {customerForm.CPOSTALCODE}</p>
      </div>

      {notes && (
        <div className="card mb-3 p-3">
          <h5>Notes</h5>
          <p className="mb-0">{notes}</p>
        </div>
      )}

      <table className="table table-bordered small">
        <thead>
          <tr>
            <th>Month</th>
            <th>Type</th>
            <th>Size</th>
            <th>Quantity</th>
            <th>Print Only</th>
            <th>Rate</th>
            <th>Print Only Rate</th>
            <th>Circulation</th>
          </tr>
        </thead>
        <tbody>
          {months.map((month, idx) => (
            <tr key={idx}>
              <td>{month}</td>
              <td>{selectedTypes[idx]}</td>
              <td>{selectedSizes[idx]}</td>
              <td>{quantities[idx]}</td>
              <td>{printOnly[idx]}</td>
              <td>{rates[idx]}</td>
              <td>{printOnlyRates[idx]}</td>
              <td>{circulations[idx]}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ✅ Totals Section */}
      <div className="text-end mb-4">
        <p><strong>Subtotal:</strong> ${subtotal.toFixed(2)}</p>
        <p><strong>Tax ({taxPercentage}%):</strong> ${tax.toFixed(2)}</p>
        <p><strong>Total:</strong> ${total.toFixed(2)}</p>
      </div>

      <div className="d-flex justify-content-between mt-4">
        <button 
          className="btn btn-secondary" 
          onClick={() => navigate("/orders", { state })}
        >
          Back to Edit
        </button>
        <button className="btn btn-success" onClick={handleFinalSubmit}>
          Confirm & Submit
        </button>
      </div>
    </div>
  );
}
