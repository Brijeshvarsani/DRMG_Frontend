import React, { useState, useEffect, useMemo } from "react";
import adSizes from "../data/adSizes.json";
import productTypes from "../data/productTypes.json";
import { getMonthLabels } from "../utils/dateUtils";
import {
  handleTypeChange,
  handleSizeChange,
  handleQuantityChange,
  handlePrintOnlyChange,
  generateSubmissionData,
  calculateTotals
} from "../utils/orderUtils";
import { saveOrder } from "../api/order";
import { buildOrderPayload } from "../services/orderService";
import { fetchOrderAndGeneratePDF } from "../services/invoiceService";
import API from "../services/api";
import MoneySaverRegionTable from "./MoneySaverRegionTable";
import CustomerSection from "./CustomerSection";
import logo from "../assets/DRMG logo.webp"; // ✅ Import your logo
import { Link, useNavigate } from "react-router-dom";

export default function OrderTable() {

  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [customerForm, setCustomerForm] = useState({
        CCOMPANY: "",
        CNAME: "",
        CEMAIL: "",
        CNUMBER: "",
        CSTREET: "",
        CCITY: "",
        CPOSTALCODE: "",
        CPROVINCE: "",
      });

  const months = getMonthLabels();

  const [selectedTypes, setSelectedTypes] = useState(Array(14).fill(""));
  const [selectedSizes, setSelectedSizes] = useState(Array(14).fill(""));
  const [rates, setRates] = useState(Array(14).fill(""));
  const [quantities, setQuantities] = useState(Array(14).fill("0"));
  const [printOnly, setPrintOnly] = useState(Array(14).fill("0"));
  const [circulations, setCirculations] = useState(Array(14).fill("0"));
  const [printOnlyEnabled, setPrintOnlyEnabled] = useState(Array(14).fill(false));
  const [printOnlyRates, setPrintOnlyRates] = useState(Array(14).fill(""));
  const [regions, setRegions] = useState([]);
  const [regionSelections, setRegionSelections] = useState(Array(14).fill([]));
  const [user, setUser] = useState(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {

    if (!token) return navigate("/");

    API.get("/profile", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => setUser(res.data.user))
      .catch(() => {
        localStorage.removeItem("token");
        navigate("/");
      });

    API.get("/regions-ms")
      .then(res => setRegions(res.data))
      .catch(err => console.error("Failed to load regions", err));
  }, []);

  const moneySaverFlags = useMemo(
    () => selectedTypes.map(type => type === "MONEY SAVER"),
    [selectedTypes]
  );

  const adSizeSelectedFlags = useMemo(
    () => selectedSizes.map(size => !!size),
    [selectedSizes]
  );

  const handlePrintOnlyCheckbox = (idx, checked) => {
    setPrintOnlyEnabled(enabledArr => {
      const newArr = [...enabledArr];
      newArr[idx] = checked;
      return newArr;
    });
    setPrintOnly(poArr => {
      const newArr = [...poArr];
      if (!checked) newArr[idx] = "0";
      return newArr;
    });
    setPrintOnlyRates(porArr => {
      const newArr = [...porArr];
      if (checked && !porArr[idx]) {
        newArr[idx] = rates[idx];
      }
      if (!checked) newArr[idx] = "";
      return newArr;
    });
    setCirculations(circArr => {
      const newArr = [...circArr];
      if (!checked) newArr[idx] = quantities[idx];
      return newArr;
    });
  };

  const handleRegionToggle = (monthIdx, region, isChecked) => {
    setRegionSelections(prev => {
      const updated = [...prev];
      const currentSet = new Set(updated[monthIdx]);
      if (isChecked) {
        currentSet.add(region.REGION);
      } else {
        currentSet.delete(region.REGION);
      }
      updated[monthIdx] = [...currentSet];
      return updated;
    });

    setQuantities(prev => {
      const updated = [...prev];
      const regionQty = parseInt(region.QUANTITY);
      const currentQty = parseInt(updated[monthIdx]) || 0;
      const newQty = isChecked ? (currentQty + regionQty) : (currentQty - regionQty);
      updated[monthIdx] = newQty > 0 ? newQty.toString() : "0";
      return updated;
    });

    setCirculations(prev => {
      const updated = [...prev];
      const regionQty = parseInt(region.QUANTITY);
      const currentCirc = parseInt(updated[monthIdx]) || 0;
      const newCirc = isChecked ? (currentCirc + regionQty) : (currentCirc - regionQty);
      updated[monthIdx] = newCirc > 0 ? newCirc.toString() : "0";
      return updated;
    });

    if (!isChecked) {
      const selectedRegions = regionSelections[monthIdx].filter(r => r !== region.REGION);
      if (selectedRegions.length === 0) {
        setPrintOnlyEnabled(prev => {
          const updated = [...prev];
          updated[monthIdx] = false;
          return updated;
        });
        setPrintOnly(prev => {
          const updated = [...prev];
          updated[monthIdx] = "0";
          return updated;
        });
        setPrintOnlyRates(prev => {
          const updated = [...prev];
          updated[monthIdx] = "";
          return updated;
        });
      }
    }
  };

  const handlePreview = () => {
    if (!selectedCustomerId || selectedCustomerId === "") {
      alert("Please select a customer before previewing the order.");
      return;
    }

    const submissionData = generateSubmissionData(
      months,
      selectedTypes,
      selectedSizes,
      quantities,
      printOnly,
      circulations,
      rates,
      printOnlyRates
    );

    if (submissionData.length === 0) {
      alert("At least one valid month entry is required.");
      return;
    }

    navigate("/order-preview", {
      state: {
        selectedCustomerId,
        customerForm,
        isNewCustomer,
        months,
        selectedTypes,
        selectedSizes,
        quantities,
        printOnly,
        circulations,
        rates,
        printOnlyRates,
        regionSelections
      },
    });
  };


  const handleSubmit = async () => {

    if (!selectedCustomerId || selectedCustomerId === "") {
      alert("Please select a customer before submitting the order.");
      return;
    }

    const submissionData = generateSubmissionData(
      months,
      selectedTypes,
      selectedSizes,
      quantities,
      printOnly,
      circulations,
      rates,
      printOnlyRates
    );

    if (submissionData.length === 0) {
      alert("At least one valid month entry is required before submitting.");
      return;
    }

    const orderPayload = {
      ...buildOrderPayload(
        selectedCustomerId,
        months,
        selectedTypes,
        selectedSizes,
        quantities,
        printOnly,
        circulations,
        rates,
        printOnlyRates
      ),
      regionSelections, // <--- Add this
      months             // <--- Needed by backend to match indices
    };
    

    try {
      const result = await saveOrder(orderPayload);
      alert("Order saved! Order ID: " + result.OId);
      fetchOrderAndGeneratePDF(result.OId);
    } catch (err) {
      alert("Failed to save order");
      console.error(err);
    }
  };

  const { subtotal, tax, total } = calculateTotals(
    months,
    selectedTypes,
    selectedSizes,
    quantities,
    rates,
    printOnly,
    printOnlyRates,
    circulations
  );

  return (
    <div className="container py-4">

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
            <img src={logo} alt="DRMG Logo" style={{ height: "90px" }} />
        </div>
        <div>
        <h2>{user?.username}</h2>
        </div>
      </div>
      <nav className="nav nav-pills d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex justify-content-between align-items-center"> 
          <Link className="nav-link" to="/dashboard">Dashboard</Link>
          {/* <Link className="nav-link" to="/orders">Orders</Link> */}
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

      <CustomerSection
        selectedCustomerId={selectedCustomerId}
        setSelectedCustomerId={setSelectedCustomerId}
        customerForm={customerForm}
        setCustomerForm={setCustomerForm}
        setIsNewCustomer={setIsNewCustomer}
      />

      <h2 className="mb-4 text-center">Monthly Order Form</h2>
      <div className="table-responsive">
        <table className="table table-bordered table-sm text-center align-middle small custom-table">
          <thead>
            <tr>
              <th className="text-start">MAILING</th>
              {months.map((month, idx) => (
                <th key={idx}>{month}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="text-start fw-bold">PRODUCT TYPE</td>
              {months.map((_, idx) => (
                <td key={idx}>
                  <select
                    value={selectedTypes[idx]}
                    onChange={e => {
                      const value = e.target.value;
                      handleTypeChange(e, idx, selectedTypes, selectedSizes, rates, setSelectedTypes, setRates);
                      if (!value) {
                        // When Product Type is set to default, also reset Ad Size for that month
                        setSelectedSizes(sizes => {
                          const arr = [...sizes];
                          arr[idx] = "";
                          return arr;
                        });
                        // Ad Size reset will cascade and trigger your previous reset logic!
                        setQuantities(q => {
                          const arr = [...q];
                          arr[idx] = "";
                          return arr;
                        });
                        setPrintOnlyEnabled(poEnabled => {
                          const arr = [...poEnabled];
                          arr[idx] = false;
                          return arr;
                        });
                        setPrintOnly(po => {
                          const arr = [...po];
                          arr[idx] = "0";
                          return arr;
                        });
                        setCirculations(circ => {
                          const arr = [...circ];
                          arr[idx] = "0";
                          return arr;
                        });
                      }
                    }}
                    className="form-select form-select-sm"
                  >
                    {productTypes.map((type, index) => (
                      <option key={index} value={type}>{type}</option>
                    ))}
                  </select>
                </td>
              ))}
            </tr>
            <tr>
              <td className="text-start fw-bold">AD SIZE</td>
              {months.map((_, idx) => (
                <td key={idx}>
                  <select
                    value={selectedSizes[idx]}
                    onChange={e => {
                      const value = e.target.value;
                      handleSizeChange(e, idx, selectedSizes, selectedTypes, rates, setSelectedSizes, setRates);
                      if (!value) {
                        setQuantities(q => {
                          const arr = [...q];
                          arr[idx] = "";
                          return arr;
                        });
                        setPrintOnlyEnabled(poEnabled => {
                          const arr = [...poEnabled];
                          arr[idx] = false;
                          return arr;
                        });
                        setPrintOnly(po => {
                          const arr = [...po];
                          arr[idx] = "0";
                          return arr;
                        });
                        setCirculations(circ => {
                          const arr = [...circ];
                          arr[idx] = "0";
                          return arr;
                        });
                      }
                    }}

                    className="form-select form-select-sm"
                    disabled={!selectedTypes[idx]}
                  >
                    {adSizes.map((size, index) => (
                      <option key={index} value={size}>{size}</option>
                    ))}
                  </select>
                </td>
              ))}
            </tr>
            <tr>
              <td className="text-start fw-bold">RATE</td>
              {months.map((_, idx) => (
                <td key={idx}>
                  <input
                    type="text"
                    inputMode="decimal"
                    pattern="[0-9]*[.]?[0-9]*"
                    value={rates[idx]}
                    onChange={(e) => {
                      const newRates = [...rates];
                      newRates[idx] = e.target.value;
                      setRates(newRates);
                    }}
                    className="form-control form-control-sm"
                    disabled={!selectedSizes[idx] || !selectedTypes[idx]}
                    style={{ MozAppearance: 'textfield' }}
                  />
                </td>
              ))}
            </tr>
            <tr>
              <td className="text-start fw-bold">QUANTITY</td>
              {months.map((_, idx) => (
                <td key={idx}>
                  <input
                    type="number"
                    min="0"
                    value={quantities[idx]}
                    onChange={(e) =>
                      handleQuantityChange(
                        e,
                        idx,
                        quantities,
                        printOnly,
                        setQuantities,
                        setCirculations
                      )
                    }
                    className="form-control form-control-sm"
                    disabled={
                      !selectedSizes[idx] || selectedTypes[idx] === "MONEY SAVER"
                    }
                  />
                </td>
              ))}
            </tr>


            {/* UPDATED PRINT ONLY ROW */}
            <tr>
              <td className="text-start fw-bold">PRINT ONLY</td>
              {months.map((_, idx) => (
                <td key={idx}>
                  <div className="d-flex justify-content-center align-items-center">
                    <input
                      type="checkbox"
                      checked={printOnlyEnabled[idx]}
                      onChange={e => handlePrintOnlyCheckbox(idx, e.target.checked)}
                      disabled={quantities[idx] === "" || quantities[idx] === "0"}
                    />
                    {printOnlyEnabled[idx] ? (
                      <input
                        type="number"
                        min="0"
                        value={printOnly[idx]}
                        onChange={e => handlePrintOnlyChange(e, idx, quantities, printOnly, setPrintOnly, setCirculations)}
                        className="form-control form-control-sm ms-2"
                        style={{ width: "80px" }}
                      />
                    ) : (
                      <span className="ms-2 text-muted">0</span>
                    )}
                  </div>
                </td>
              ))}
            </tr>
            <tr>
              <td className="text-start fw-bold">PRINT ONLY RATE</td>
              {months.map((_, idx) => (
                <td key={idx}>
                  {printOnlyEnabled[idx] ? (
                    <input
                      type="text"
                      inputMode="decimal"
                      pattern="[0-9]*[.]?[0-9]*"
                      value={printOnlyRates[idx]}
                      onChange={e => {
                        const newRates = [...printOnlyRates];
                        newRates[idx] = e.target.value;
                        setPrintOnlyRates(newRates);
                      }}
                      className="form-control form-control-sm"
                      style={{ width: "80px" }}
                    />
                  ) : (
                    <span className="ms-2 text-muted">-</span>
                  )}
                </td>
              ))}
            </tr>

            <tr>
              <td className="text-start fw-bold">CIRCULATION</td>
              {months.map((_, idx) => (
                <td key={idx}>{circulations[idx]}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <div className="table-responsive">
        <MoneySaverRegionTable
          months={months}
          regions={regions}
          selectedTypes={selectedTypes}
          selectedRegions={regionSelections}
          moneySaverFlags={moneySaverFlags}
          onRegionToggle={handleRegionToggle}
          adSizeSelectedFlags={adSizeSelectedFlags}
        />
      </div>
      <div className="text-end mb-3 me-2">
        <p><strong>Subtotal:</strong> ${subtotal.toFixed(2)}</p>
        <p><strong>Tax (14%):</strong> ${tax.toFixed(2)}</p>
        <p><strong>Total:</strong> ${total.toFixed(2)}</p>
      </div>
      <div className="text-end mt-3">
        <button className="btn btn-primary" onClick={handleSubmit}>Preview</button>
      </div>
    </div>
  );
}