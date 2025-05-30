import React, { useEffect, useState } from "react";
import { fetchCustomers, fetchProvinces, createCustomer } from "../api/customer";

export default function CustomerSection({
  selectedCustomerId,
  setSelectedCustomerId,
  customerForm,
  setCustomerForm,
  setIsNewCustomer,
}) {
  const [customers, setCustomers] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formErrors, setFormErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [isNewCustomer, setIsNewCustomerLocal] = useState(!selectedCustomerId);
  
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

  const handleSelectChange = (e) => {
    const val = e.target.value;
    setFormErrors({});
    setSubmitError("");

    if (val === "new") {
      setIsNewCustomerLocal(true);
      setSelectedCustomerId(null);
      setCustomerForm({
        CCOMPANY: "",
        CNAME: "",
        CEMAIL: "",
        CNUMBER: "",
        CSTREET: "",
        CCITY: "",
        CPROVINCE: "",
        CPOSTALCODE: "",
      });
    } else {
      setIsNewCustomerLocal(false);
      const selected = customers.find((c) => c.CID === Number(val));
      setSelectedCustomerId(Number(val));
      setCustomerForm({ ...selected });
    }
  };

  function validateCustomerForm(form) {
    const errors = {};
    if (!form.CCOMPANY?.trim()) errors.CCOMPANY = "Company name is required";
    if (!form.CNAME?.trim()) errors.CNAME = "Contact name is required";
    if (!form.CSTREET?.trim()) errors.CSTREET = "Street address is required";
    if (!form.CCITY?.trim()) errors.CCITY = "City is required";
    if (!form.CEMAIL?.trim()) {
      errors.CEMAIL = "Email is required";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(form.CEMAIL)) {
      errors.CEMAIL = "Invalid email address";
    }
    if (!form.CNUMBER?.trim()) {
      errors.CNUMBER = "Phone number is required";
    } else if (!/^\d{10,}$/.test(form.CNUMBER.replace(/\D/g, ""))) {
      errors.CNUMBER = "Invalid phone number (10+ digits required)";
    }
    if (!form.CPOSTALCODE?.trim()) {
      errors.CPOSTALCODE = "Postal code is required";
    } else if (!/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(form.CPOSTALCODE)) {
      errors.CPOSTALCODE = "Invalid Canadian postal code";
    }
    if (!form.CPROVINCE?.trim()) {
      errors.CPROVINCE = "Province is required";
    }
    return errors;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerForm((f) => ({ ...f, [name]: value }));
    setFormErrors((errors) => ({ ...errors, [name]: undefined }));
    setSubmitError("");
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    setSubmitError("");
    const errors = validateCustomerForm(customerForm);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      const res = await createCustomer(customerForm);
      setSelectedCustomerId(res.CID);
      setIsNewCustomerLocal(false);
      setFormErrors({});
      setCustomerForm({
        CCOMPANY: "",
        CNAME: "",
        CEMAIL: "",
        CNUMBER: "",
        CSTREET: "",
        CCITY: "",
        CPROVINCE: "",
        CPOSTALCODE: "",
      });
      const customerData = await fetchCustomers();
      setCustomers(customerData);
    } catch (err) {
      setSubmitError(
        err?.response?.data?.error || "Could not create customer. Please try again."
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

      {/* Show form in both cases, fields are read-only for existing customers */}
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
              disabled={!isNewCustomer}
            />
            {formErrors.CCOMPANY && <small className="text-danger">{formErrors.CCOMPANY}</small>}
          </div>
          <div className="col">
            <input
              className="form-control"
              name="CNAME"
              placeholder="Contact Name"
              value={customerForm.CNAME}
              onChange={handleInputChange}
              required
              disabled={!isNewCustomer}
            />
            {formErrors.CNAME && <small className="text-danger">{formErrors.CNAME}</small>}
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
              disabled={!isNewCustomer}
            />
            {formErrors.CEMAIL && <small className="text-danger">{formErrors.CEMAIL}</small>}
          </div>
          <div className="col">
            <input
              className="form-control"
              name="CNUMBER"
              placeholder="Phone Number"
              value={customerForm.CNUMBER}
              onChange={handleInputChange}
              required
              disabled={!isNewCustomer}
            />
            {formErrors.CNUMBER && <small className="text-danger">{formErrors.CNUMBER}</small>}
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
              disabled={!isNewCustomer}
            />
            {formErrors.CSTREET && <small className="text-danger">{formErrors.CSTREET}</small>}
          </div>
          <div className="col">
            <input
              className="form-control"
              name="CCITY"
              placeholder="City"
              value={customerForm.CCITY}
              onChange={handleInputChange}
              required
              disabled={!isNewCustomer}
            />
            {formErrors.CCITY && <small className="text-danger">{formErrors.CCITY}</small>}
          </div>
          <div className="col">
            <input
              className="form-control"
              name="CPOSTALCODE"
              placeholder="Postal Code"
              value={customerForm.CPOSTALCODE}
              onChange={handleInputChange}
              required
              disabled={!isNewCustomer}
            />
            {formErrors.CPOSTALCODE && <small className="text-danger">{formErrors.CPOSTALCODE}</small>}
          </div>
          <div className="col">
            <select
              className="form-select"
              name="CPROVINCE"
              value={customerForm.CPROVINCE}
              onChange={handleInputChange}
              required
              disabled={!isNewCustomer}
            >
              <option value="">-- Province --</option>
              {provinces.map((p) => (
                <option key={p.PID} value={p.PNAME}>
                  {p.PNAME}
                </option>
              ))}
            </select>
            {formErrors.CPROVINCE && <small className="text-danger">{formErrors.CPROVINCE}</small>}
          </div>
        </div>

        {isNewCustomer && (
          <>
            {submitError && <div className="alert alert-danger py-1">{submitError}</div>}
            <button className="btn btn-success" type="submit">
              Create Customer
            </button>
          </>
        )}
      </form>
    </div>
  );
}
