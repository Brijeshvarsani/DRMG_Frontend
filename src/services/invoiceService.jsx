// import { generateInvoicePDF } from "../utils/pdfUtils";
// import API from "./api";

// // Fetch order + customer info and rows from backend, then generate PDF
// export async function fetchOrderAndGeneratePDF(orderId) {
//   try {
//     console.log("Fetching order details for PDF generation... " + orderId);
//     const response = await API.get("/orders/" + orderId);

//     console.log("Response from API:", response.data);
//     if (!response.data || !response.data.order || !response.data.rows) {
//       throw new Error("Incomplete response from server");
//     }
    
//     // const { order, rows } = response.data;
//     const order = response.data.order[0];
//     const rows = response.data.rows;

//     // Map rows for PDF
//     const pdfRows = rows.map(row => ({
//       month: row.MONTH,
//       productType: row.PRODUCTTYPE,
//       adSize: row.ADSIZE,
//       deliveryType: row.DELIVERYTYPE, // MONEY SAVER regions already substituted in backend
//       qty: row.QTY,
//       rate: row.RATE,
//     }));

//     // Build customer info
//     const customer = {
//       CNAME: order.CNAME,
//       CSTREET: order.CSTREET,
//       CCITY: order.CCITY,
//       CPROVINCE: order.CPROVINCE,
//       CPOSTALCODE: order.CPOSTALCODE,
//       CEMAIL: order.CEMAIL,
//       CNUMBER: order.CNUMBER,
//       CCOMPANY: order.CCOMPANY,
//       CTAX: order.PTAX
//     };

//     generateInvoicePDF(pdfRows, order, customer);
//   } catch (error) {
//     console.error("PDF generation failed:", error);
//   }
// }

import { generateInvoicePDF } from "../utils/pdfUtils";
import API from "./api";

// Fetch order + customer info + insight and rows, then generate PDF
export async function fetchOrderAndGeneratePDF(orderId) {
  try {
    console.log("Fetching order details for PDF generation... " + orderId);
    const response = await API.get("/orders/" + orderId);

    if (!response.data || !response.data.order || !response.data.rows) {
      throw new Error("Incomplete response from server");
    }

    const order = response.data.order[0];
    const rows = response.data.rows;

    // Map rows for PDF
    const pdfRows = rows.map(row => ({
      month: row.MONTH,
      productType: row.PRODUCTTYPE,
      adSize: row.ADSIZE,
      deliveryType: row.DELIVERYTYPE,
      qty: row.QTY,
      rate: row.RATE,
    }));

    // Customer details
    const customer = {
      CNAME: order.CNAME,
      CSTREET: order.CSTREET,
      CCITY: order.CCITY,
      CPROVINCE: order.CPROVINCE,
      CPOSTALCODE: order.CPOSTALCODE,
      CEMAIL: order.CEMAIL,
      CNUMBER: order.CNUMBER,
      CCOMPANY: order.CCOMPANY,
      CTAX: order.PTAX
    };

    // Fetch DRMG Insight
    let insight = null;
    try {
      const insightRes = await API.get("/insight/" + orderId);
      insight = insightRes.data;
    } catch (insightError) {
      console.warn("No DRMG Insight found or failed to load:", insightError?.response?.data?.message || insightError.message);
    }

    // Generate PDF with insight
    generateInvoicePDF(pdfRows, order, customer, insight);

  } catch (error) {
    console.error("PDF generation failed:", error);
  }
}
