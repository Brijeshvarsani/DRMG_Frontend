// src/components/DashboardHeader.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/DRMG logo.webp"; // Update path based on your project

export default function Header({ user }) {
  const navigate = useNavigate();

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <img src={logo} alt="DRMG Logo" style={{ height: "90px" }} />
        </div>
        <div>
          <h2>Welcome, {user.username}</h2>
        </div>
      </div>

      <nav className="nav nav-pills d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex justify-content-between align-items-center">
            <Link className="nav-link" to="/dashboard">Dashboard</Link>
            <Link className="nav-link" to="/orders">Create Order</Link>
            <Link className="nav-link" to="/order-list">Orders List</Link>
            <Link className="nav-link" to="/filtered-summary">Filtered Summary</Link>
            <Link className="nav-link" to="/payment-info">Payment Info</Link>
        </div>
        <div>
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/");
            }}
          >
            Logout
          </button>
        </div>
      </nav>
    </>
  );
}
