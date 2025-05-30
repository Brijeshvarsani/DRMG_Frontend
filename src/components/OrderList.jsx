import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import logo from "../assets/DRMG logo.webp"; // ✅ Import your logo
import { Table, Button } from "react-bootstrap";
import Header from "./Header";

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {

    document.title = "DRMG - Order List"; // ✅ Set tab title
    
        const favicon = document.querySelector("link[rel~='icon']");
        if (favicon) {
          favicon.href = logo;
        } else {
          const newFavicon = document.createElement("link");
          newFavicon.rel = "icon";
          newFavicon.href = logo;
          document.head.appendChild(newFavicon);
        }
    

    const token = localStorage.getItem("token");
    if (!token) return navigate("/");

    API.get("/profile", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => setUser(res.data.user))
      .catch(() => {
        localStorage.removeItem("token");
        navigate("/");
      });
  }, [navigate]);

  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem("token");
    API.get("/orders", {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
      .then((res) => setOrders(res.data))
      .catch((err) => console.error("Failed to fetch orders", err));
  }, [user]);

  if (!user) return <p>Loading...</p>;

  return (
    <div className="container mt-4">
      <Header user={user} />
      <h3 className="mb-4">Orders</h3>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Company Name</th>
            {user.role === "admin" && <th>Created By</th>}
            <th>Date</th>
            <th>Edit</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.OID}>
              <td>{order.OID}</td>
              <td>{order.CCOMPANY}</td>
              {user.role === "admin" && <td>{order.createdBy}</td>}
              <td>{new Date(order.ODATE).toLocaleDateString()}</td>
              <td>
                <Button
                  size="sm"
                  variant="outline-primary"
                  onClick={() => navigate(`/edit-order/${order.OID}`)}
                >
                  Edit
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
