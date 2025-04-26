// export async function saveOrder(orderData) {
//     const response = await fetch("http://localhost:5000/api/orders", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(orderData),
//     });
  
//     let responseBody;
//     try {
//       responseBody = await response.json();
//     } catch {
//       responseBody = await response.text();
//     }
  
//     if (!response.ok) {
//       console.error("Order save error response:", responseBody);
//       throw new Error("Failed to save order: " + JSON.stringify(responseBody));
//     }
//     return responseBody;
//   }
  
//   export async function getOrder(orderId) {
//     const res = await fetch(`http://localhost:5000/api/orders/${orderId}`);
//     if (!res.ok) throw new Error("Could not load order");
//     return await res.json();
//   }
  
//   export async function saveOrderUpdate(payload) {
//     const res = await fetch(`http://localhost:5000/api/orders/${payload.OId}`, {
//       method: "PUT",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(payload),
//     });
//     if (!res.ok) throw new Error("Failed to update order");
//     return await res.json();
//   }

import API from "../services/api";

// Save a new order
export async function saveOrder(orderData) {
  try {
    const res = await API.post("/orders", orderData);
    return res.data;
  } catch (err) {
    // You can inspect err.response.data for more details
    console.error("Order save error response:", err.response?.data || err);
    throw new Error("Failed to save order: " + JSON.stringify(err.response?.data || err.message));
  }
}

// Get an order by ID
export async function getOrder(orderId) {
  try {
    const res = await API.get(`/orders/${orderId}`);
    return res.data;
  } catch (err) {
    throw new Error("Could not load order: " + JSON.stringify(err.response?.data || err.message));
  }
}

// Update an existing order
export async function saveOrderUpdate(payload) {
  try {
    const res = await API.put(`/orders/${payload.OId}`, payload);
    return res.data;
  } catch (err) {
    throw new Error("Failed to update order: " + JSON.stringify(err.response?.data || err.message));
  }
}
