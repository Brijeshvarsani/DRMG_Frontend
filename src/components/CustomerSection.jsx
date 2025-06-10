import React, { useEffect, useState } from "react";
import { fetchCustomers, fetchProvinces, createCustomer } from "../api/customer";
import API from "../services/api"; // Adjust the import path as necessary

export default function CustomerSection({
  selectedCustomerId,
  setSelectedCustomerId,
  customerForm,
  setCustomerForm,
  setIsNewCustomer,
  taxPercentage,
  setTaxPercentage,
}) {
  const [customers, setCustomers] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formErrors, setFormErrors] = useState({});
  const [submitError, setSubmitError] = useState("");

  // Load customers and provinces on mount
  useEffect(() => {
    async function loadData() {
      const customerData = await fetchCustomers();
      const provinceData = await fetchProvinces();
      setCustomers(customerData);
      setProvinces(provinceData);
      setLoading(false);
    }
    loadData();
  }, []);

  useEffect(() => {
    const fetchCustomerDetails = async () => {
      if (!selectedCustomerId) return;

      try {
        const res = await API.get(`/customers/${selectedCustomerId}`);
        const customer = res.data;

        // Set tax and full customer form data
        setTaxPercentage(customer.PTAX || 8);
        setCustomerForm({
          CCOMPANY: customer.CCOMPANY || "",
          CNAME: customer.CNAME || "",
          CEMAIL: customer.CEMAIL || "",
          CNUMBER: customer.CNUMBER || "",
          CSTREET: customer.CSTREET || "",
          CCITY: customer.CCITY || "",
          CPOSTALCODE: customer.CPOSTALCODE || "",
          CPROVINCE: customer.CPROVINCE || "",
        });
      } catch (err) {
        console.error("Failed to fetch customer details:", err);
        setTaxPercentage(9);
      }
    };

    fetchCustomerDetails();
  }, [selectedCustomerId]);


  // Handle dropdown selection
  const handleSelectChange = (e) => {
    const val = e.target.value;
    setFormErrors({});
    setSubmitError("");
    if (val === "new") {
      setIsNewCustomer(true);
      setSelectedCustomerId(null);
    } else {
      setIsNewCustomer(false);
      setSelectedCustomerId(Number(val));
    }
  };

  // Validate fields
  function validateCustomerForm(form) {
    const errors = {};
    if (!form.CCOMPANY || !form.CCOMPANY.trim())
      errors.CCOMPANY = "Company name is required";
    if (!form.CNAME || !form.CNAME.trim())
      errors.CNAME = "Contact name is required";
    if (!form.CSTREET || !form.CSTREET.trim())
      errors.CSTREET = "Street address is required";
    if (!form.CCITY || !form.CCITY.trim())
      errors.CCITY = "City is required";
    if (!form.CEMAIL || !form.CEMAIL.trim()) {
      errors.CEMAIL = "Email is required";
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(form.CEMAIL)
    ) {
      errors.CEMAIL = "Invalid email address";
    }
    if (!form.CNUMBER || !form.CNUMBER.trim()) {
      errors.CNUMBER = "Phone number is required";
    } else if (!/^\d{10,}$/.test(form.CNUMBER.replace(/\D/g, ""))) {
      errors.CNUMBER = "Invalid phone number (10+ digits required)";
    }
    if (!form.CPOSTALCODE || !form.CPOSTALCODE.trim()) {
      errors.CPOSTALCODE = "Postal code is required";
    } else if (!/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(form.CPOSTALCODE)) {
      errors.CPOSTALCODE = "Invalid Canadian postal code";
    }    
    if (!form.CPROVINCE || !form.CPROVINCE.trim()) {
      errors.CPROVINCE = "Province is required";
    }
    return errors;
  }

  // Handle new customer input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerForm((f) => ({ ...f, [name]: value }));
    setFormErrors((errors) => ({ ...errors, [name]: undefined }));
    setSubmitError("");
  };

  // Save new customer
  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    setSubmitError("");
    const errors = validateCustomerForm(customerForm);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

     // For debugging

    try {
      const res = await createCustomer(customerForm);
      setSelectedCustomerId(res.CID);
      setIsNewCustomer(false);
      setFormErrors({});
      setCustomerForm({
        CCOMPANY: "",
        CNAME: "",
        CEMAIL: "",
        CNUMBER: "",
        CSTREET: "",
        CCITY: "",
        CPROVINCE: "",
      });
      // Optionally reload customer list after creation:
      const customerData = await fetchCustomers();
      setCustomers(customerData);
    } catch (err) {
      setSubmitError(
        err?.response?.data?.error ||
          "Could not create customer. Please try again."
      );
    }
  };

  if (loading) return <div>Loading customers...</div>;

  return (
    <div className="mb-4">
      <h5><b>Customer Information</b></h5>
      <div className="mb-3">
        <select
          className="form-select"
          value={selectedCustomerId || "new"}
          onChange={handleSelectChange}
        >
          <option value="new">-- New Customer --</option>
          {customers.map((c) => (
            <option key={c.CID} value={c.CID}>
              {c.CCOMPANY || c.CNAME}
            </option>
          ))}
        </select>
      </div>

      {!selectedCustomerId ? (
        <form onSubmit={handleCreateCustomer} autoComplete="off">
          <div className="row mb-2">
            <div className="col">
              <input
                className="form-control"
                name="CCOMPANY"
                placeholder="Company Name"
                value={customerForm.CCOMPANY}
                onChange={handleInputChange}
                required
              />
              {formErrors.CCOMPANY && (
                <small className="text-danger">{formErrors.CCOMPANY}</small>
              )}
            </div>
            <div className="col">
              <input
                className="form-control"
                name="CNAME"
                placeholder="Contact Name"
                value={customerForm.CNAME}
                onChange={handleInputChange}
                required
              />
              {formErrors.CNAME && (
                <small className="text-danger">{formErrors.CNAME}</small>
              )}
            </div>
          </div>
          <div className="row mb-2">
            <div className="col">
              <input
                className="form-control"
                name="CEMAIL"
                placeholder="Email"
                value={customerForm.CEMAIL}
                onChange={handleInputChange}
                required
              />
              {formErrors.CEMAIL && (
                <small className="text-danger">{formErrors.CEMAIL}</small>
              )}
            </div>
            <div className="col">
              <input
                className="form-control"
                name="CNUMBER"
                placeholder="Phone Number"
                value={customerForm.CNUMBER}
                onChange={handleInputChange}
                required
              />
              {formErrors.CNUMBER && (
                <small className="text-danger">{formErrors.CNUMBER}</small>
              )}
            </div>
          </div>
          <div className="row mb-2">
            <div className="col-6">
              <input
                className="form-control"
                name="CSTREET"
                placeholder="Street"
                value={customerForm.CSTREET}
                onChange={handleInputChange}
                required
              />
              {formErrors.CSTREET && (
                <small className="text-danger">{formErrors.CSTREET}</small>
              )}
            </div>
            <div className="col">
              <input
                className="form-control"
                name="CCITY"
                placeholder="City"
                value={customerForm.CCITY}
                onChange={handleInputChange}
                required
              />
              {formErrors.CCITY && (
                <small className="text-danger">{formErrors.CCITY}</small>
              )}
            </div>
            <div className="col">
              <input
                className="form-control"
                name="CPOSTALCODE"
                placeholder="Postal Code"
                value={customerForm.CPOSTALCODE}
                onChange={handleInputChange}
                required
              />
              {formErrors.CPOSTALCODE && (
                <small className="text-danger">{formErrors.CPOSTALCODE}</small>
              )}
            </div>

            <div className="col">
              <select
                className="form-select"
                name="CPROVINCE"
                value={customerForm.CPROVINCE}
                onChange={handleInputChange}
                required
              >
                <option value="">-- Province --</option>
                {provinces.map((p) => (
                  <option key={p.PID} value={p.PNAME}>
                    {p.PNAME}
                  </option>
                ))}
              </select>
              {formErrors.CPROVINCE && (
                <small className="text-danger">{formErrors.CPROVINCE}</small>
              )}
            </div>
          </div>
          {submitError && (
            <div className="alert alert-danger py-1">{submitError}</div>
          )}
          <button className="btn btn-success" type="submit">
            Create Customer
          </button>
        </form>
      ) : (
        <div className="p-3 border rounded bg-light">
          <h6 className="mb-2"><b>Selected Customer Details:</b></h6>
          <p><b>Company:</b> {customerForm.CCOMPANY}</p>
          <p><b>Contact:</b> {customerForm.CNAME}</p>
          <p><b>Email:</b> {customerForm.CEMAIL}</p>
          <p><b>Phone:</b> {customerForm.CNUMBER}</p>
          <p><b>Address:</b> {customerForm.CSTREET}, {customerForm.CCITY}, {customerForm.CPROVINCE}, {customerForm.CPOSTALCODE}</p>
        </div>
      )}
    </div>
  );
}