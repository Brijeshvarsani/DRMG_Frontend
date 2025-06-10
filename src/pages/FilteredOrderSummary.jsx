import React, { useState } from "react";
import { getOrderSummary } from "../api/order";
import logo from "../assets/DRMG Logo.webp";
import { Link } from "react-router-dom";

export default function FilteredOrderSummary() {
  const [month, setMonth] = useState("May");
  const [year, setYear] = useState(new Date().getFullYear());
  const [data, setData] = useState([]);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i); // last 10 years

  const handleFetch = async () => {
    try {
      const result = await getOrderSummary(month, year);
      setData(result);
    } catch (err) {
      console.error("Failed to fetch summary", err);
    }
  };

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <img src={logo} alt="Logo" height={80} />
        <h3>Order Summary by Month</h3>
        <Link to="/dashboard" className="btn btn-outline-secondary btn-sm">Back to Dashboard</Link>
      </div>

      <div className="mb-4 d-flex gap-2">
        <select className="form-control" value={month} onChange={(e) => setMonth(e.target.value)}>
          {months.map((m, i) => (
            <option key={i} value={m}>{m}</option>
          ))}
        </select>
        <select className="form-control" value={year} onChange={(e) => setYear(e.target.value)}>
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        <button className="btn btn-primary" onClick={handleFetch}>Filter</button>
      </div>

      <table className="table table-bordered table-sm">
        <thead>
          <tr>
            <th>Client</th>
            <th>Month</th>
            <th>Total ($)</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr><td colSpan="3" className="text-center">No data</td></tr>
          ) : (
            data.map((row, idx) => (
              <tr key={idx}>
                <td>{row.clientName}</td>
                <td>{row.MONTH}</td>
                <td>${parseFloat(row.total).toFixed(2)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
