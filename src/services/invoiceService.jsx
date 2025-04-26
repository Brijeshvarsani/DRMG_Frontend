import { generateInvoicePDF } from "../utils/pdfUtils";

// Fetch order and customer info using the orderId, then call PDF utils
export async function fetchOrderAndGeneratePDF(orderId) {
  // Fetch order + customer info and rows from backend
  const response = await fetch(`http://localhost:5000/api/orders/${orderId}`);
  if (!response.ok) throw new Error("Failed to fetch order details");

  const data = await response.json();
  const { order, rows } = data;

  // Re-map rows if needed to fit the structure your PDF expects
  // For this example, we assume your DB fields match your PDF field names
  const pdfRows = rows.map(row => ({
    month: row.MONTH,
    productType: row.PRODUCTTYPE,
    adSize: row.ADSIZE,
    deliveryType: row.DELIVERYTYPE,
    qty: row.QTY,
    rate: row.RATE,
  }));

  // Build customer info object
  const customer = {
    CNAME: order.CNAME,
    CSTREET: order.CSTREET,
    CCITY: order.CCITY,
    CPROVINCE: order.CPROVINCE,
    CPOSTALCODE: order.CPOSTALCODE,
    CEMAIL: order.CEMAIL,
    CNUMBER: order.CNUMBER,
    CCOMPANY: order.CCOMPANY
  };

  // Now call your PDF util, passing both
  generateInvoicePDF(pdfRows, orderId, customer);
}
