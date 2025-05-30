import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import logo from "../assets/DRMG logo.webp";
import { Table, Button, Form, Row, Col } from "react-bootstrap";

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [user, setUser] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [creators, setCreators] = useState([]);

  const [filters, setFilters] = useState({
    company: "",
    createdBy: "",
    startDate: "",
    endDate: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    document.title = "DRMG - Order List";
    const favicon = document.querySelector("link[rel~='icon']");
    if (favicon) favicon.href = logo;
    else {
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
    })
      .then((res) => {
        setOrders(res.data);
        setFilteredOrders(res.data);

        // Extract unique company names & creators
        const uniqueCompanies = [...new Set(res.data.map(o => o.CCOMPANY))];
        const uniqueCreators = [...new Set(res.data.map(o => o.createdBy))];
        setCompanies(uniqueCompanies);
        setCreators(uniqueCreators);
      })
      .catch((err) => console.error("Failed to fetch orders", err));
  }, [user]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    let temp = [...orders];
    const { company, createdBy, startDate, endDate } = filters;

    if (company) temp = temp.filter((o) => o.CCOMPANY === company);
    if (user.role === "admin" && createdBy) temp = temp.filter((o) => o.createdBy === createdBy);
    if (startDate) temp = temp.filter((o) => new Date(o.ODATE) >= new Date(startDate));
    if (endDate) temp = temp.filter((o) => new Date(o.ODATE) <= new Date(endDate));

    setFilteredOrders(temp);
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-4">Orders</h3>
        <Button variant="outline-secondary" onClick={() => navigate("/dashboard")}>
          ← Back to Dashboard
        </Button>
      </div>

      {/* Filters */}
      <Row className="mb-3">
        <Col md={3}>
          <Form.Select name="company" value={filters.company} onChange={handleFilterChange}>
            <option value="">All Companies</option>
            {companies.map((c, idx) => (
              <option key={idx} value={c}>{c}</option>
            ))}
          </Form.Select>
        </Col>
        {user.role === "admin" && (
          <Col md={3}>
            <Form.Select name="createdBy" value={filters.createdBy} onChange={handleFilterChange}>
              <option value="">All Creators</option>
              {creators.map((c, idx) => (
                <option key={idx} value={c}>{c}</option>
              ))}
            </Form.Select>
          </Col>
        )}
        <Col md={2}>
          <Form.Control type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} />
        </Col>
        <Col md={2}>
          <Form.Control type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} />
        </Col>
        <Col md={2}>
          <Button variant="primary" onClick={applyFilters}>Apply Filters</Button>
        </Col>
      </Row>

      {/* Table */}
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
          {filteredOrders.map((order) => (
            <tr key={order.OID}>
              <td>{order.OID}</td>
              <td>{order.CCOMPANY}</td>
              {user.role === "admin" && <td>{order.createdBy}</td>}
              <td>{new Date(order.ODATE).toLocaleDateString()}</td>
              <td>
                <Button size="sm" variant="outline-primary" onClick={() => navigate(`/edit-order/${order.OID}`)}>
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
