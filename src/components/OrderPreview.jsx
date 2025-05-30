import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { saveOrder } from "../api/order";
import { buildOrderPayload } from "../services/orderService";
import { fetchOrderAndGeneratePDF } from "../services/invoiceService";

export default function OrderPreview() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const {
    customerForm,
    isNewCustomer,
    selectedCustomerId,
    months,
    selectedTypes,
    selectedSizes,
    quantities,
    printOnly,
    circulations,
    rates,
    printOnlyRates,
    regionSelections
  } = state;

  const handleFinalSubmit = async () => {
    try {
      const payload = buildOrderPayload(
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
      payload.regionSelections = regionSelections;
      payload.months = months;

      const result = await saveOrder(payload);
      alert("Order submitted! Order ID: " + result.OId);
      fetchOrderAndGeneratePDF(result.OId);
      navigate("/dashboard");
    } catch (err) {
      alert("Submission failed.");
      console.error(err);
    }
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4">Review Order Summary</h2>

      {/* Customer Info Card */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Customer Details</h5>
          <p><strong>Customer Type:</strong> {isNewCustomer ? "New Customer" : "Existing Customer"}</p>
          {!isNewCustomer && <p><strong>Customer ID:</strong> {selectedCustomerId}</p>}
          <p><strong>Company:</strong> {customerForm.CCOMPANY}</p>
          <p><strong>Name:</strong> {customerForm.CNAME}</p>
          <p><strong>Email:</strong> {customerForm.CEMAIL}</p>
          <p><strong>Phone:</strong> {customerForm.CNUMBER}</p>
          <p><strong>Address:</strong> {customerForm.CSTREET}, {customerForm.CCITY}, {customerForm.CPROVINCE}, {customerForm.CPOSTALCODE}</p>
        </div>
      </div>

      {/* Order Table */}
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

      {/* Actions */}
      <div className="d-flex justify-content-between mt-4">
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          Go Back
        </button>
        <button className="btn btn-success" onClick={handleFinalSubmit}>
          Confirm & Submit
        </button>
      </div>
    </div>
  );
}
