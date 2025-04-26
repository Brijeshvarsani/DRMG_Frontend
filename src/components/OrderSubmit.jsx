import React from "react";
import { saveOrder } from "../api/orders";
import { buildOrderPayload } from "../services/orderService";

function OrderSubmit({ selectedCustomerId, submissionData, onSuccess }) {
  const handleOrderSubmit = async () => {
    try {
      const orderPayload = buildOrderPayload(selectedCustomerId, submissionData);
      const result = await saveOrder(orderPayload);
      alert("Order saved! Order ID: " + result.OId);
      if (onSuccess) onSuccess(result.OId);
    } catch (err) {
      alert("Failed to save order");
      console.error(err);
    }
  };

  return (
    <button className="btn btn-primary" onClick={handleOrderSubmit}>
      Submit Order
    </button>
  );
}

export default OrderSubmit;
