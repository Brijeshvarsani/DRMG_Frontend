import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logoBase64 from "../assets/logoBase64";

export const generateInvoicePDF = (orderRows, order, customer) => {
  const doc = new jsPDF();

  // Set white background
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight(), 'F');

  const pageWidth = doc.internal.pageSize.getWidth();
  doc.addImage(logoBase64, 'WEBP', pageWidth - 50, 10, 35, 18);


  // Customer Header
  doc.setFontSize(20);
  let y = 20;
  doc.text(`Invoice Number: ${order.OID}`, 14, y);

  y += 7;

  const orderDate = new Date(order.ODATE).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  doc.setFontSize(11);
  doc.text(`Customer: ${customer.CNAME}`, 14, y += 7);
  doc.text(`Company: ${customer.CCOMPANY}`, 14, y += 7);
  doc.text(`Address: ${customer.CSTREET}, ${customer.CCITY}, ${customer.CPROVINCE}, ${customer.CPOSTALCODE}`, 14, y += 7);
  doc.text(`Email: ${customer.CEMAIL}`, 14, y += 7);
  doc.text(`Phone: ${customer.CNUMBER}`, 14, y += 7);
  doc.text(`Date: ${orderDate}`, 14, y += 7);

  y += 7

  // Calculate totals
  let overallSubtotal = 0;
  let overallTax = 0;
  let overallGrandTotal = 0;

  orderRows = orderRows.filter(r => r.qty > 0);

  const taxPercentage = customer.CTAX ? parseFloat(customer.CTAX) : 10;

  const tableBody = orderRows.map(item => {
    const qty = parseInt(item.qty) || 0;
    const rate = parseFloat(item.rate) || 0;
    const amount = +(qty * rate);
    const tax = +(amount * taxPercentage/100);
    const total = amount + tax;
    overallSubtotal += amount;
    overallTax += tax;
    overallGrandTotal += total;

    return [
      item.month,
      item.productType,
      item.adSize,
      item.deliveryType || "-", // Shows region names if MONEY SAVER, otherwise "-"
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
      "Month", "Product Type", "Ad Size", "Delivery Type", "Qty", "Rate", "Amount", "Tax (" + taxPercentage + "%):", "Total"
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
  
  doc.save(`Invoice Number: ${order.OID}`);
};