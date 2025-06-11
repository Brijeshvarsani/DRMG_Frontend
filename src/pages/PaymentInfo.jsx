import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import jsPDF from "jspdf";


export default function PaymentInfo() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [paymentMethod, setPaymentMethod] = useState("");
  const [form, setForm] = useState({
    ccNumber: "",
    ccExpiry: "",
    ccCVV: "",
    ccType: "",
    cardOnFile: false,
    financialInstitution: "",
    branch: "",
    institution: "",
    accountName: "",
    accountNumber: "",
    accountType: "Personal",
    voidChequeAttached: false,
    chequeType: "",
    signature: "",
    printName: "",
    signatureDate: "",
  });

  useEffect(() => {
    API.get("/customers", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then((res) => setCustomers(res.data))
      .catch((err) => console.error("Failed to fetch customers:", err));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!selectedCustomerId || !selectedCustomer) {
    alert("Please select a customer.");
    return;
  }

  const payload = {
    customerId: selectedCustomerId,
    customerDetails: selectedCustomer,
    paymentMethod,
    ...form,
  };

  // Generate PDF
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text("Payment Information", 20, 20);

  let y = 30;
  doc.setFontSize(12);
  doc.text(`Customer: ${selectedCustomer.CCOMPANY} - ${selectedCustomer.CNAME}`, 20, y); y += 10;
  doc.text(`Email: ${selectedCustomer.CEMAIL}`, 20, y); y += 10;
  doc.text(`Phone: ${selectedCustomer.CNUMBER}`, 20, y); y += 10;
  doc.text(`Payment Method: ${paymentMethod}`, 20, y); y += 10;

  if (paymentMethod === "credit") {
    doc.text(`Card Type: ${form.ccType}`, 20, y); y += 10;
    doc.text(`Card Number: ${form.ccNumber}`, 20, y); y += 10;
    doc.text(`Expiry: ${form.ccExpiry}`, 20, y); y += 10;
  } else if (paymentMethod === "pad") {
    doc.text(`Institution: ${form.financialInstitution}`, 20, y); y += 10;
    doc.text(`Branch #: ${form.branch}`, 20, y);
    doc.text(`Institution #: ${form.institution}`, 100, y); y += 10;
    doc.text(`Account Name: ${form.accountName}`, 20, y); y += 10;
    doc.text(`Account Number #: ${form.accountNumber}`, 20, y); y += 10;
    doc.text(`Account Type: ${form.accountType}`, 20, y); y += 10;
  } else if (paymentMethod === "cheque") {
    doc.text(`Cheque #: ${form.chequeNumber || "N/A"}`, 20, y); y += 10;
  } else if (paymentMethod === "etransfer") {
    doc.text("E-Transfer selected — no extra details required.", 20, y); y += 10;
  }

  doc.text(`Signature: ${form.signature}`, 20, y); y += 10;
  doc.text(`Print Name: ${form.printName}`, 20, y); y += 10;
  doc.text(`Date: ${form.signatureDate}`, 20, y);

  // Convert to blob
  const pdfBlob = doc.output("blob");

  // Send to backend to email
  const formData = new FormData();
  formData.append("pdf", pdfBlob, `payment-info-${selectedCustomerId}.pdf`);
  formData.append("email", "abc@drgm.com");

  try {
    await API.post("/send-payment-pdf", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    console.log("PDF sent to email successfully");
    navigate("/", { state: payload });
  } catch (err) {
    console.error("Error sending PDF:", err);
    alert("Failed to send PDF to email.");
  }
};



  return (
    <div className="container py-4">
      <h2 className="mb-4">Payment Information</h2>

      <form onSubmit={handleSubmit}>
        {/* CUSTOMER DROPDOWN */}
        <div className="mb-3">
          <label className="form-label fw-bold">Customer Information</label>
          <select
            className="form-select"
            value={selectedCustomerId}
            onChange={(e) => {
              const id = e.target.value;
              setSelectedCustomerId(id);
              const found = customers.find(c => String(c.CID) === id);
              setSelectedCustomer(found);
            }}
            required
          >
            <option value="">-- Select Customer --</option>
            {customers.map((cust) => (
              <option key={cust.CID} value={cust.CID}>
                {cust.CCOMPANY} - {cust.CNAME}
              </option>
            ))}
          </select>
        </div>

        {/* CUSTOMER INFO */}
        {selectedCustomer && (
          <div className="p-3 bg-light border rounded mb-4">
            <p className="fw-bold mb-2">Selected Customer Details:</p>
            <p><strong>Company:</strong> {selectedCustomer.CCOMPANY}</p>
            <p><strong>Contact:</strong> {selectedCustomer.CNAME}</p>
            <p><strong>Email:</strong> {selectedCustomer.CEMAIL}</p>
            <p><strong>Phone:</strong> {selectedCustomer.CNUMBER}</p>
            <p>
              <strong>Address:</strong> {selectedCustomer.CSTREET}, {selectedCustomer.CCITY}, {selectedCustomer.CPROVINCE}, {selectedCustomer.CPOSTALCODE}
            </p>
          </div>
        )}

        {/* PAYMENT METHOD */}
        <div className="mb-3">
          <label className="form-label">Select Payment Method</label>
          <select
            className="form-select"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            required
          >
            <option value="">-- Choose --</option>
            <option value="credit">Credit Card</option>
            <option value="pad">Pre-Authorized Debit</option>
            <option value="cheque">Cheque</option>
            <option value="etransfer">E-Transfer</option>
          </select>
        </div>

        {/* CREDIT CARD SECTION */}
        {paymentMethod === "credit" && (
        <div className="border p-3 mb-3">
            <div className="mb-3">
            <label>CC Number</label>
            <input
                type="text"
                className="form-control"
                name="ccNumber"
                value={form.ccNumber}
                onChange={handleChange}
                required
            />
            </div>
            <div className="row mb-3">
            <div className="col">
            <label>Expiry</label>
            <input
                type="month"
                className="form-control"
                name="ccExpiry"
                value={form.ccExpiry}
                onChange={handleChange}
            />
            </div>
            <div className="col">
                <label>CVV Code</label>
                <input
                type="text"
                className="form-control"
                name="ccCVV"
                value={form.ccCVV}
                onChange={handleChange}
                required
                />
            </div>
            </div>
            <div className="mb-3">
            <label>Card Type</label>
            <div className="form-check">
                <input
                type="radio"
                className="form-check-input"
                name="ccType"
                value="Visa"
                checked={form.ccType === "Visa"}
                onChange={handleChange}
                required
                />
                <label className="form-check-label">Visa</label>
            </div>
            <div className="form-check">
                <input
                type="radio"
                className="form-check-input"
                name="ccType"
                value="MasterCard"
                checked={form.ccType === "MasterCard"}
                onChange={handleChange}
                />
                <label className="form-check-label">MasterCard</label>
            </div>
            <div className="form-check">
                <input
                type="radio"
                className="form-check-input"
                name="ccType"
                value="Amex"
                checked={form.ccType === "Amex"}
                onChange={handleChange}
                />
                <label className="form-check-label">American Express</label>
            </div>
            </div>
        </div>
        )}

        {/* PAD SECTION */}
        {paymentMethod === "pad" && (
          <div className="border p-3 mb-3">
            <div className="mb-2">
              <label>Financial Institution</label>
              <input type="text" className="form-control" name="financialInstitution" value={form.financialInstitution} onChange={handleChange} />
            </div>
            <div className="row">
              <div className="col">
                <label>Branch #</label>
                <input type="text" className="form-control" name="branch" value={form.branch} onChange={handleChange} />
              </div>
              <div className="col">
                <label>Institution #</label>
                <input type="text" className="form-control" name="institution" value={form.institution} onChange={handleChange} />
              </div>
            </div>
            <div className="mt-2">
              <label>Account Name</label>
              <input type="text" className="form-control" name="accountName" value={form.accountName} onChange={handleChange} />
            </div>
            <div className="mt-2">
              <label>Account Number</label>
              <input type="text" className="form-control" name="accountNumber" value={form.accountNumber} onChange={handleChange} />
            </div>
            <div className="mt-2">
              <label>Account Type</label>
              <div className="form-check">
                <input type="radio" className="form-check-input" name="accountType" value="Personal" checked={form.accountType === "Personal"} onChange={handleChange} />
                <label className="form-check-label">Personal</label>
              </div>
              <div className="form-check">
                <input type="radio" className="form-check-input" name="accountType" value="Business" checked={form.accountType === "Business"} onChange={handleChange} />
                <label className="form-check-label">Business</label>
              </div>
            </div>
            <div className="form-check mt-2">
              <input type="checkbox" className="form-check-input" name="voidChequeAttached" checked={form.voidChequeAttached} onChange={handleChange} />
              <label className="form-check-label">Void cheque(s) attached</label>
            </div>
          </div>
        )}

        {/* CHEQUE SECTION */}
        {paymentMethod === "cheque" && (
        <div className="border p-3 mb-3">
            <div className="mb-3">
            <label htmlFor="chequeNumber" className="form-label">Cheque Number</label>
            <input
                type="text"
                className="form-control"
                id="chequeNumber"
                name="chequeNumber"
                value={form.chequeNumber || ""}
                onChange={handleChange}
                required
            />
            </div>
        </div>
        )}

        {/* E-TRANSFER SECTION */}
        {paymentMethod === "etransfer" && (
        <div className="border p-3 mb-3">
            <p className="mb-0">E-Transfer selected. No additional details required.</p>
        </div>
        )}


        {/* SIGNATURE SECTION */}
        <div className="row mb-3">
          <div className="col">
            <label>Signature</label>
            <input type="text" className="form-control" name="signature" value={form.signature} onChange={handleChange} />
          </div>
          <div className="col">
            <label>Print Name</label>
            <input type="text" className="form-control" name="printName" value={form.printName} onChange={handleChange} />
          </div>
          <div className="col">
            <label>Date of Signature</label>
            <input type="date" className="form-control" name="signatureDate" value={form.signatureDate} onChange={handleChange} />
          </div>
        </div>

        <div className="text-end">
          <button type="submit" className="btn btn-primary">Submit Payment Info</button>
        </div>
      </form>
    </div>
  );
}
