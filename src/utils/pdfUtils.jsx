// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";
// import logoBase64 from "../assets/logoBase64";

// export const generateInvoicePDF = (orderRows, order, customer) => {
//   const doc = new jsPDF();

//   // Set white background
//   doc.setFillColor(255, 255, 255);
//   doc.rect(0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight(), 'F');

//   const pageWidth = doc.internal.pageSize.getWidth();
//   doc.addImage(logoBase64, 'WEBP', pageWidth - 50, 10, 35, 18);


//   // Customer Header
//   doc.setFontSize(20);
//   let y = 20;
//   doc.text(`Invoice Number: ${order.OID}`, 14, y);

//   y += 7;

//   const orderDate = new Date(order.ODATE).toLocaleDateString("en-US", {
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//   });

//   doc.setFontSize(11);
//   doc.text(`Customer: ${customer.CNAME}`, 14, y += 7);
//   doc.text(`Company: ${customer.CCOMPANY}`, 14, y += 7);
//   doc.text(`Address: ${customer.CSTREET}, ${customer.CCITY}, ${customer.CPROVINCE}, ${customer.CPOSTALCODE}`, 14, y += 7);
//   doc.text(`Email: ${customer.CEMAIL}`, 14, y += 7);
//   doc.text(`Phone: ${customer.CNUMBER}`, 14, y += 7);
//   doc.text(`Date: ${orderDate}`, 14, y += 7);

//   y += 7

//   // Calculate totals
//   let overallSubtotal = 0;
//   let overallTax = 0;
//   let overallGrandTotal = 0;

//   orderRows = orderRows.filter(r => r.qty > 0);

//   const taxPercentage = customer.CTAX ? parseFloat(customer.CTAX) : 10;

//   const tableBody = orderRows.map(item => {
//     const qty = parseInt(item.qty) || 0;
//     const rate = parseFloat(item.rate) || 0;
//     const amount = +(qty * rate);
//     const tax = +(amount * taxPercentage/100);
//     const total = amount + tax;
//     overallSubtotal += amount;
//     overallTax += tax;
//     overallGrandTotal += total;

//     return [
//       item.month,
//       item.productType,
//       item.adSize,
//       item.deliveryType || "-", // Shows region names if MONEY SAVER, otherwise "-"
//       qty,
//       `$${rate.toFixed(2)}`,
//       `$${amount.toFixed(2)}`,
//       `$${tax.toFixed(2)}`,
//       `$${total.toFixed(2)}`
//     ];
//   });

//   autoTable(doc, {
//     startY: y,
//     head: [[
//       "Month", "Product Type", "Ad Size", "Delivery Type", "Qty", "Rate", "Amount", "Tax (" + taxPercentage + "%):", "Total"
//     ]],
//     body: tableBody,
//     theme: "grid",
//     headStyles: { fillColor: [41, 128, 185] },
//     styles: { fontSize: 10 },
//     foot: [[
//       "", "", "", "", "", "Totals:",
//       `$${overallSubtotal.toFixed(2)}`,
//       `$${overallTax.toFixed(2)}`,
//       `$${overallGrandTotal.toFixed(2)}`
//     ]],
//     footStyles: { fillColor: [44, 62, 80], textColor: 255, fontStyle: 'bold' }
//   });
  
//   if (order.NOTES && order.NOTES.trim() !== "") {
//     const finalY = doc.lastAutoTable.finalY + 10; // Position notes after the table
//     doc.setFontSize(12);
//     doc.setFont("helvetica", "bold");
//     doc.text("Notes:", 14, finalY);
//     doc.setFont("helvetica", "normal");
//     doc.setFontSize(11);

//     const noteLines = doc.splitTextToSize(order.NOTES, pageWidth - 28); // wrap text
//     doc.text(noteLines, 14, finalY + 6);
//   }
//   doc.save(`Invoice Number: ${order.OID}`);
// };

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logoBase64 from "../assets/logoBase64";

export const generateInvoicePDF = (orderRows, order, customer, insight = null) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Background
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), 'F');

  // Logo & Booking Number
  doc.addImage(logoBase64, 'WEBP', 14, 10, 35, 18);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(`Booking Number: ${order.OID}`, pageWidth - 14, 20, { align: 'right' });

  // Section layout
  let y = 35;
  const leftX = 14;
  const rightX = pageWidth / 2 + 4;
  const wrapWidth = pageWidth / 2 - 20;

  // Section headers
  doc.setFontSize(12);
  doc.text("Customer Info", leftX, y);
  doc.text("DRMG Insight", rightX, y);

  doc.setFontSize(11);

  const orderDate = new Date(order.ODATE).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const customerFields = [
    { label: "Customer", value: customer.CNAME },
    { label: "Company", value: customer.CCOMPANY },
    { label: "Address", value: `${customer.CSTREET}, ${customer.CCITY}, ${customer.CPROVINCE}, ${customer.CPOSTALCODE}` },
    { label: "Email", value: customer.CEMAIL },
    { label: "Phone", value: customer.CNUMBER },
    { label: "Date", value: orderDate }
  ];

  const insightFields = [
    { label: "Start Date", value: insight?.start_date || "-" },
    { label: "End Date", value: insight?.end_date || "-" },
    { label: "Call Tracking Type", value: insight?.call_tracking_type || "-" },
    { label: "Forward Calls To", value: insight?.forward_calls_to || "-" },
    { label: "QR Code Type", value: insight?.qr_code_type || "-" },
    { label: "Scan Destination", value: insight?.scan_destination || "-" },
    { label: "Email Results To", value: insight?.email_results_to || "-" }
  ];

  let leftY = y + 7;
  let rightY = y + 7;

  const renderWrappedLabelValue = (doc, x, y, label, value, maxWidth) => {
    doc.setFont("helvetica", "bold");
    const labelText = `${label}: `;
    const labelWidth = doc.getTextWidth(labelText);

    doc.text(labelText, x, y);

    doc.setFont("helvetica", "normal");
    const wrappedValue = doc.splitTextToSize(value, maxWidth - labelWidth);
    doc.text(wrappedValue, x + labelWidth, y);
    return wrappedValue.length * 6;
  };

  for (let i = 0; i < Math.max(customerFields.length, insightFields.length); i++) {
    if (customerFields[i]) {
      const deltaY = renderWrappedLabelValue(doc, leftX, leftY, customerFields[i].label, customerFields[i].value, wrapWidth);
      leftY += deltaY;
    }

    if (insightFields[i]) {
      const deltaY = renderWrappedLabelValue(doc, rightX, rightY, insightFields[i].label, insightFields[i].value, wrapWidth);
      rightY += deltaY;
    }
  }

  y = Math.max(leftY, rightY) + 10;

  // Table prep
  orderRows = orderRows.filter(r => r.qty > 0);
  let overallSubtotal = 0, overallTax = 0, overallGrandTotal = 0;
  const taxPercentage = customer.CTAX ? parseFloat(customer.CTAX) : 10;

  const tableBody = orderRows.map(item => {
    const qty = parseInt(item.qty) || 0;
    const rate = parseFloat(item.rate) || 0;
    const amount = qty * rate;
    const tax = amount * taxPercentage / 100;
    const total = amount + tax;

    overallSubtotal += amount;
    overallTax += tax;
    overallGrandTotal += total;

    return [
      item.month,
      item.productType,
      item.adSize,
      item.deliveryType || "-",
      qty,
      `$${rate.toFixed(2)}`,
      `$${amount.toFixed(2)}`,
      `$${tax.toFixed(2)}`,
      `$${total.toFixed(2)}`
    ];
  });

  autoTable(doc, {
    startY: y,
    head: [[
      "Month", "Product Type", "Ad Size", "Delivery Type", "Qty", "Rate", "Amount", `Tax (${taxPercentage}%)`, "Total"
    ]],
    body: tableBody,
    theme: "grid",
    headStyles: { fillColor: [41, 128, 185] },
    styles: { fontSize: 10 },
    foot: [[
      "", "", "", "", "", "Totals:",
      `$${overallSubtotal.toFixed(2)}`,
      `$${overallTax.toFixed(2)}`,
      `$${overallGrandTotal.toFixed(2)}`
    ]],
    footStyles: { fillColor: [44, 62, 80], textColor: 255, fontStyle: 'bold' }
  });

  // Notes
  if (order.NOTES && order.NOTES.trim() !== "") {
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Notes:", 14, finalY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    const noteLines = doc.splitTextToSize(order.NOTES, pageWidth - 28);
    doc.text(noteLines, 14, finalY + 6);
  }

  doc.save(`Invoice Number: ${order.OID}`);
};

