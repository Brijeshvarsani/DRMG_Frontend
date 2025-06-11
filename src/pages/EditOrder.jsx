import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { getOrder, saveOrderUpdate } from "../api/order";
import { groupRowsForEdit } from "../services/orderEditHelper";
import { buildOrderPayload } from "../services/orderService";
import { getMonthLabelsFrom } from "../utils/dateUtils";
import productTypes from "../data/productTypes.json";
import adSizes from "../data/adSizes.json";
import MoneySaverRegionTable from "../components/MoneySaverRegionTable";
import API from "../services/api";
import 'bootstrap/dist/css/bootstrap.min.css';
import adRates from "../data/adRates.json"; // Assuming adRates is a JSON file
import { calculateTotals } from "../utils/orderUtils";
import logo from "../assets/DRMG logo.webp"; // ✅ Import your logo
import { Link, useNavigate } from "react-router-dom";
import { fetchOrderAndGeneratePDF } from "../services/invoiceService";
import Header from "../components/Header";
import { getInsight } from "../api/order";
import { saveInsight } from "../api/order";

export default function EditOrder() {
  const { orderId } = useParams();
  const [months, setMonths] = useState([]);
  const [formData, setFormData] = useState([]);
  const [order, setOrder] = useState(null);
  const [printOnlyEnabled, setPrintOnlyEnabled] = useState(Array(14).fill(false));
  const [regions, setRegions] = useState([]);
  const [regionSelections, setRegionSelections] = useState(Array(14).fill([]));
  const [user, setUser] = useState(null);
  const [taxPercentage, setTaxPercentage] = useState(14);
  const token = localStorage.getItem("token");
  const [notes, setNotes] = useState("");

  const navigate = useNavigate();

  const [drmgInsight, setDrmgInsight] = useState({
    startDate: "",
    endDate: "",
    forwardCallsTo: "",
    scanDestination: "",
    emailResultsTo: "",
    callTrackingType: "",    // e.g., "New,TollFree"
    qrCodeType: "",          // e.g., "Existing"
  });


  useEffect(() => {

    if (!token) return navigate("/");

    API.get("/profile", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        setUser(res.data.user) 
        console.log("User data:", res.data.user); // Debugging line
      }) 
      .catch(() => {
        localStorage.removeItem("token");
        navigate("/");
      });

    getOrder(orderId).then(data => {
      const startMonth = data.rows[0]?.MONTH || null;
      const monthsArr = getMonthLabelsFrom(startMonth);
      setMonths(monthsArr);

      // console.log("Months array:", data.row);

      const baseRows = groupRowsForEdit(data.rows, monthsArr);
      setFormData(
        baseRows.map(row => ({
          ...row,
          quantity: (parseInt(row.printOnly) || 0) + (parseInt(row.circulation) || 0)
        }))
      );

      setOrder(data.order[0]);
      setNotes(data.order[0]?.NOTES || "");

      setTaxPercentage(data.order[0].PTAX || 14);
      
      setPrintOnlyEnabled(
        baseRows.map(row => !!(parseInt(row.printOnly) > 0))
      );
      
      if (data.regionRows) {
        const uniqueMonths = [...new Set(data.rows.map(row => row.MONTH))];
        const sr = uniqueMonths.map(month => {
          return data.regionRows
            .filter(region => region.MONTH === month)
            .map(region => region.REGION);
        });
        setRegionSelections(sr);
      }
    });

    API.get("/regions-ms")
      .then(res => setRegions(res.data))
      .catch(err => console.error("Failed to load regions", err));

    // Fetch DRMG Insight
    getInsight(orderId)
      .then(data => {
        setDrmgInsight({
          start_date: data.start_date?.split("T")[0] || "",
          end_date: data.end_date?.split("T")[0] || "",
          forward_calls_to: data.forward_calls_to || "",
          scan_destination: data.scan_destination || "",
          email_results_to: data.email_results_to || "",
          call_tracking_type: data.call_tracking_type || "",
          qr_code_type: data.qr_code_type || ""
        });
      })
      .catch(() => console.warn("⚠️ No insight found for this order (may be first-time creation)"));


  }, [orderId]);

  const moneySaverFlags = useMemo(
    () => formData.map(row => row.productType === "MONEY SAVER"),
    [formData]
  );
  
  const adSizeSelectedFlags = useMemo(
    () => formData.map(row => !!row.adSize),
    [formData]
  );

  const handleChange = (idx, field, value) => {
    setFormData(old =>
      old.map((row, i) => {
        if (i !== idx) return row;
  
        if (field === "productType" && value === "") {
          // Reset all dependent fields
          return {
            ...row,
            productType: "",
            adSize: "",
            rate: 0,
            quantity: 0,
            printOnly: 0,
            printOnlyRate: 0,
            circulation: 0,
          };
        }
  
        // Update rate if adSize is changed
        if (field === "adSize") {
          const rate = adRates[row.productType]?.[value] || 0;
          return {
            ...row,
            adSize: value,
            rate,
          };
        }
  
        return { ...row, [field]: value };
      })
    );
  
    // Clear selected regions if product type is cleared
    if (field === "productType" && value === "") {
      setRegionSelections(prev => {
        const updated = [...prev];
        updated[idx] = [];
        return updated;
      });
    }
  };

  const handleQuantityChange = (idx, value) => {
    setFormData(old => old.map((row, i) => {
      if (i !== idx) return row;
      const quantity = parseInt(value) || 0;
      const printOnly = parseInt(row.printOnly) || 0;
      const circulation = printOnlyEnabled[idx]
        ? Math.max(quantity - printOnly, 0)
        : quantity;
      return { ...row, quantity, circulation };
    }));
  };

  const handlePrintOnlyChange = (idx, value) => {
    setFormData(old => old.map((row, i) => {
      if (i !== idx) return row;
      const printOnly = parseInt(value) || 0;
      const quantity = parseInt(row.quantity) || 0;
      const circulation = Math.max(quantity - printOnly, 0);
      return { ...row, printOnly, circulation };
    }));
  };

  const handlePrintOnlyCheckbox = (idx, checked) => {
    setPrintOnlyEnabled(poArr => {
      const newArr = [...poArr];
      newArr[idx] = checked;
      return newArr;
    });
  
    setFormData(old => old.map((row, i) => {
      if (i !== idx) return row;
  
      const quantity = parseInt(row.quantity) || 0;
      const rate = parseFloat(row.rate) || 0;
  
      if (!checked) {
        return {
          ...row,
          printOnly: 0,
          printOnlyRate: "",
          circulation: quantity,
        };
      }
  
      // If checkbox is checked and quantity > 0, auto-fill printOnlyRate with rate
      if (checked && quantity > 0) {
        return {
          ...row,
          printOnly: 0,
          printOnlyRate: rate,
          circulation: quantity,
        };
      }
  
      return {
        ...row,
        printOnlyRate: row.printOnlyRate || rate, // fallback for safety
      };
    }));
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
  
      const newSelections = [...currentSet];
      updated[monthIdx] = newSelections;
  
      // Calculate new total quantity based on selected regions
      const totalQty = newSelections.reduce((sum, regionName) => {
        const found = regions.find(r => r.REGION === regionName);
        return sum + (found ? parseInt(found.QUANTITY) || 0 : 0);
      }, 0);
  
      // Update formData accordingly
      setFormData(old => old.map((row, i) => {
        if (i !== monthIdx) return row;
  
        const updatedRow = {
          ...row,
          quantity: totalQty,
          circulation: totalQty - (printOnlyEnabled[monthIdx] ? parseInt(row.printOnly) || 0 : 0),
        };
  
        // If all regions are deselected, reset printOnly fields
        if (totalQty === 0) {
          updatedRow.printOnly = 0;
          updatedRow.printOnlyRate = 0;
          updatedRow.circulation = 0;
  
          setPrintOnlyEnabled(prev => {
            const copy = [...prev];
            copy[monthIdx] = false;
            return copy;
          });
        }
  
        return updatedRow;
      }));
  
      return updated;
    });
  };
  

  const handleSave = async () => {
    if (!order || !months || !Array.isArray(months)) {
      alert("Months array not ready!");
      return;
    }

    const payload = buildOrderPayload(
      order.CID,
      months,
      formData.map(r => r.productType),
      formData.map(r => r.adSize),
      formData.map(r => r.quantity),
      formData.map(r => r.printOnly),
      formData.map(r => r.circulation),
      formData.map(r => r.rate),
      formData.map(r => r.printOnlyRate)
    );

    payload.OId = order.OID;
    payload.regionSelections = regionSelections;
    payload.months = months;
    payload.userId = user?.id;
    payload.notes = notes;

    console.log("Payload to be sent:", payload);

    const insightPayload = {
      OID: order.OID,
      start_date: drmgInsight.start_date || "",
      end_date: drmgInsight.end_date || "",
      call_tracking_type: drmgInsight.call_tracking_type || "",
      forward_calls_to: drmgInsight.forward_calls_to || "",
      qr_code_type: drmgInsight.qr_code_type || "",
      scan_destination: drmgInsight.scan_destination || "",
      email_results_to: drmgInsight.email_results_to || ""
    };

    try {
      await saveInsight(insightPayload);
      await saveOrderUpdate(payload);
      alert("Order and DRMG Insight updated!");
      await fetchOrderAndGeneratePDF(payload.OId);
      navigate("/order-list");
    } catch (err) {
      alert("Failed to save order or DRMG Insight");
      console.error(err);
    }
  };

  if (!order || formData.length !== months.length) return <div>Loading...</div>;

  const { subtotal, tax, total } = calculateTotals(
    months,
    formData.map(row => row.productType),
    formData.map(row => row.adSize),
    formData.map(row => row.quantity),
    formData.map(row => row.rate),
    formData.map(row => row.printOnly),
    formData.map(row => row.printOnlyRate),
    formData.map(row => row.circulation),
    taxPercentage
  );  

  return (
    <div className="container my-2">
      {user && <Header user={user} /> }

      <h2 className="mb-4 text-center">Order No. {orderId}</h2>

      <div className="mb-4 p-3 border rounded bg-light">
        <h5>Customer Details</h5>
        <p><strong>Company:</strong> {order.CCOMPANY}</p>
        <p><strong>Contact Name:</strong> {order.CNAME}</p>
        <p><strong>Email:</strong> {order.CEMAIL}</p>
        <p><strong>Phone:</strong> {order.CNUMBER}</p>
        <p><strong>Address:</strong> {order.CSTREET}, {order.CCITY}, {order.CPROVINCE}, {order.CPOSTALCODE}</p>
      </div>

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
                    value={formData[idx]?.productType || ""}
                    onChange={e => handleChange(idx, "productType", e.target.value)}
                    className="form-select form-select-sm"
                  >
                    {productTypes.map((type, i) => (
                      <option key={i} value={type}>{type}</option>
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
                    value={formData[idx]?.adSize || ""}
                    onChange={e => handleChange(idx, "adSize", e.target.value)}
                    className="form-select form-select-sm"
                    disabled={!formData[idx]?.productType}
                  >
                    {adSizes.map((size, i) => (
                      <option key={i} value={size}>{size}</option>
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
                    value={formData[idx]?.rate || 0.00}
                    onChange={e => handleChange(idx, "rate", e.target.value)}
                    className="form-control form-control-sm"
                    disabled={!formData[idx]?.adSize || !formData[idx]?.productType}
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
                    value={formData[idx]?.quantity || 0}
                    onChange={e => handleQuantityChange(idx, e.target.value)}
                    className="form-control form-control-sm"
                    disabled={!formData[idx]?.adSize || formData[idx]?.productType === "MONEY SAVER"}
                  />
                </td>
              ))}
            </tr>
            <tr>
              <td className="text-start fw-bold">PRINT ONLY</td>
              {months.map((_, idx) => (
                <td key={idx}>
                  <div className="d-flex justify-content-center align-items-center">
                    <input
                      type="checkbox"
                      checked={!!printOnlyEnabled[idx]}
                      onChange={e => handlePrintOnlyCheckbox(idx, e.target.checked)}
                      disabled={!formData[idx]?.adSize || (parseInt(formData[idx]?.quantity) || 0) === 0}
                    />
                    {printOnlyEnabled[idx] ? (
                      <input
                        type="number"
                        min="0"
                        value={formData[idx]?.printOnly || 0}
                        onChange={e => handlePrintOnlyChange(idx, e.target.value)}
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
                      value={formData[idx]?.printOnlyRate || formData[idx]?.rate || ""}
                      onChange={e => handleChange(idx, "printOnlyRate", e.target.value)}
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
                <td key={idx}>
                  <input
                    type="number"
                    min="0"
                    value={formData[idx]?.circulation || 0}
                    readOnly
                    className="form-control form-control-sm bg-light"
                  />
                </td>
              ))}
            </tr>

          </tbody>
        </table>
      </div>

      <div className="table-responsive">
      <MoneySaverRegionTable
          months={months}
          regions={regions}
          selectedTypes={formData.map(row => row.productType)}
          selectedRegions={regionSelections}
          moneySaverFlags={moneySaverFlags}
          onRegionToggle={handleRegionToggle}
          adSizeSelectedFlags={adSizeSelectedFlags}
        />
      </div>

      <div className="card p-3 mb-4">
        <h5 className="fw-bold mb-3">DRMG Insight</h5>

        <div className="row mb-2">
          <div className="col-md-6">
            <label className="form-label">Start Date</label>
            <input
              type="date"
              className="form-control"
              value={drmgInsight.start_date}
              onChange={(e) => setDrmgInsight({ ...drmgInsight, start_date: e.target.value })}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">End Date</label>
            <input
              type="date"
              className="form-control"
              value={drmgInsight.end_date}
              onChange={(e) => setDrmgInsight({ ...drmgInsight, end_date: e.target.value })}
            />
          </div>
        </div>

        <div className="row mb-2">
          <div className="col-md-12">
            <label className="fw-bold">Call Tracking</label><br />
            {["New", "Existing", "TollFree", "Local"].map((key) => (
              <div className="form-check form-check-inline" key={key}>
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={drmgInsight.call_tracking_type?.split(",").map(s => s.trim()).includes(key)}
                  onChange={() => {
                    const current = new Set(drmgInsight.call_tracking_type?.split(",").map(s => s.trim()).filter(Boolean));
                    current.has(key) ? current.delete(key) : current.add(key);
                    setDrmgInsight({ ...drmgInsight, call_tracking_type: Array.from(current).join(",") });
                  }}
                />
                <label className="form-check-label">{key === "TollFree" ? "Toll Free" : key}</label>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-2">
          <label className="form-label">Forward Calls To</label>
          <input
            className="form-control"
            value={drmgInsight.forward_calls_to}
            onChange={(e) => setDrmgInsight({ ...drmgInsight, forward_calls_to: e.target.value })}
          />
        </div>

        <div className="row mb-2">
          <div className="col-md-12">
            <label className="fw-bold">QR Code</label><br />
            {["New", "Existing"].map((key) => (
              <div className="form-check form-check-inline" key={key}>
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={drmgInsight.qr_code_type?.split(",").map(s => s.trim()).includes(key)}
                  onChange={() => {
                    const current = new Set(drmgInsight.qr_code_type?.split(",").map(s => s.trim()).filter(Boolean));
                    current.has(key) ? current.delete(key) : current.add(key);
                    setDrmgInsight({ ...drmgInsight, qr_code_type: Array.from(current).join(",") });
                  }}
                />
                <label className="form-check-label">{key}</label>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-2">
          <label className="form-label">Scan Destination</label>
          <input
            className="form-control"
            value={drmgInsight.scan_destination}
            onChange={(e) => setDrmgInsight({ ...drmgInsight, scan_destination: e.target.value })}
          />
        </div>

        <div className="mb-2">
          <label className="form-label">Email Results To</label>
          <input
            type="email"
            className="form-control"
            value={drmgInsight.email_results_to}
            onChange={(e) => setDrmgInsight({ ...drmgInsight, email_results_to: e.target.value })}
          />
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label fw-bold">Notes</label>
        <textarea
          className="form-control"
          rows="4"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Update special notes or instructions for this order..."
        />
      </div>

      <div className="text-end mb-3 me-2">
        <p><strong>Subtotal:</strong> ${subtotal.toFixed(2)}</p>
        <p><strong>Tax ({taxPercentage}%):</strong> ${tax.toFixed(2)}</p>
        <p><strong>Total:</strong> ${total.toFixed(2)}</p>
      </div>

      <div className="text-end mt-3">
        <button className="btn btn-primary" onClick={handleSave}>Save Changes</button>
      </div>
    </div>
  );
}