// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import { getOrder, saveOrderUpdate } from "../api/order";
// import { groupRowsForEdit } from "../services/orderEditHelper";
// import { buildOrderPayload } from "../services/orderService";
// import { getMonthLabelsFrom } from "../utils/dateUtils";
// import productTypes from "../data/productTypes.json";
// import adSizes from "../data/adSizes.json";
// import 'bootstrap/dist/css/bootstrap.min.css';

// export default function EditOrder() {
//   const { orderId } = useParams();
//   const [months, setMonths] = useState([]);
//   const [formData, setFormData] = useState([]);
//   const [order, setOrder] = useState(null);

//   // For checkbox control of printOnly
//   const [printOnlyEnabled, setPrintOnlyEnabled] = useState(Array(14).fill(false));

//   useEffect(() => {
//     getOrder(orderId).then(data => {
//       const startMonth = data.rows[0]?.MONTH || "MAY 24";
//       const monthsArr = getMonthLabelsFrom(startMonth);
//       setMonths(monthsArr);
//       setFormData(groupRowsForEdit(data.rows, monthsArr));
//       setOrder(data.order);

//       // Enable printOnly checkbox for months where printOnly > 0
//       setPrintOnlyEnabled(
//         groupRowsForEdit(data.rows, monthsArr).map(row => !!(parseInt(row.printOnly) > 0))
//       );
//     });
//   }, [orderId]);

//   const handleChange = (idx, field, value) => {
//     setFormData(old =>
//       old.map((row, i) => i === idx ? { ...row, [field]: value } : row)
//     );
//   };

//   // Handle enabling/disabling Print Only field with a checkbox (like OrderTable)
//   const handlePrintOnlyCheckbox = (idx, checked) => {
//     setPrintOnlyEnabled(poArr => {
//       const newArr = [...poArr];
//       newArr[idx] = checked;
//       return newArr;
//     });
//     setFormData(old => old.map((row, i) => {
//       if (i !== idx) return row;
//       // If disabling, set printOnly and printOnlyRate to 0
//       if (!checked) {
//         return { ...row, printOnly: 0, printOnlyRate: row.rate || 0 };
//       }
//       // If enabling and printOnly is blank, set to 0 and printOnlyRate = rate
//       if (checked && (!row.printOnly || row.printOnly === "")) {
//         return { ...row, printOnly: 0, printOnlyRate: row.rate || 0 };
//       }
//       return row;
//     }));
//   };

//   const handleSave = async () => {
//     if (!order) return;
//     const payload = buildOrderPayload(order.OID, order.CID, months,
//       formData.map(r => r.productType),
//       formData.map(r => r.adSize),
//       formData.map(r => r.circulation + r.printOnly), // Total quantity (if needed)
//       formData.map(r => r.printOnly),
//       formData.map(r => r.circulation),
//       formData.map(r => r.rate),
//       formData.map(r => r.printOnlyRate)
//     );
//     await saveOrderUpdate(payload);
//     alert("Order updated!");
//   };

//   if (!order || formData.length !== months.length) return <div>Loading...</div>;

//   return (
//     <div className="container">
//       <h2 className="mb-4 text-center">Edit Order #{orderId}</h2>
//       <div className="table-responsive">
//         <table className="table table-bordered table-sm text-center align-middle small custom-table">
//           <thead>
//             <tr>
//               <th className="text-start">MAILING</th>
//               {months.map((month, idx) => (
//                 <th key={idx}>{month}</th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             <tr>
//               <td className="text-start fw-bold">PRODUCT TYPE</td>
//               {months.map((_, idx) => (
//                 <td key={idx}>
//                   <select
//                     value={formData[idx]?.productType || ""}
//                     onChange={e => handleChange(idx, "productType", e.target.value)}
//                     className="form-select form-select-sm"
//                   >
//                     {productTypes.map((type, i) => (
//                       <option key={i} value={type}>{type}</option>
//                     ))}
//                   </select>
//                 </td>
//               ))}
//             </tr>
//             <tr>
//               <td className="text-start fw-bold">AD SIZE</td>
//               {months.map((_, idx) => (
//                 <td key={idx}>
//                   <select
//                     value={formData[idx]?.adSize || ""}
//                     onChange={e => handleChange(idx, "adSize", e.target.value)}
//                     className="form-select form-select-sm"
//                     disabled={!formData[idx]?.productType}
//                   >
//                     {adSizes.map((size, i) => (
//                       <option key={i} value={size}>{size}</option>
//                     ))}
//                   </select>
//                 </td>
//               ))}
//             </tr>
//             <tr>
//               <td className="text-start fw-bold">RATE</td>
//               {months.map((_, idx) => (
//                 <td key={idx}>
//                   <input
//                     type="text"
//                     inputMode="decimal"
//                     pattern="[0-9]*[.]?[0-9]*"
//                     value={formData[idx]?.rate || ""}
//                     onChange={e => handleChange(idx, "rate", e.target.value)}
//                     className="form-control form-control-sm"
//                     disabled={!formData[idx]?.adSize || !formData[idx]?.productType}
//                     style={{ MozAppearance: 'textfield' }}
//                   />
//                 </td>
//               ))}
//             </tr>
//             <tr>
//               <td className="text-start fw-bold">PRINT ONLY</td>
//               {months.map((_, idx) => (
//                 <td key={idx}>
//                   <div className="d-flex justify-content-center align-items-center">
//                     <input
//                       type="checkbox"
//                       checked={!!printOnlyEnabled[idx]}
//                       onChange={e => handlePrintOnlyCheckbox(idx, e.target.checked)}
//                       disabled={!formData[idx]?.adSize}
//                     />
//                     {printOnlyEnabled[idx] ? (
//                       <input
//                         type="number"
//                         min="0"
//                         value={formData[idx]?.printOnly || 0}
//                         onChange={e => handleChange(idx, "printOnly", e.target.value)}
//                         className="form-control form-control-sm ms-2"
//                         style={{ width: "80px" }}
//                       />
//                     ) : (
//                       <span className="ms-2 text-muted">0</span>
//                     )}
//                   </div>
//                 </td>
//               ))}
//             </tr>
//             <tr>
//               <td className="text-start fw-bold">PRINT ONLY RATE</td>
//               {months.map((_, idx) => (
//                 <td key={idx}>
//                   {printOnlyEnabled[idx] ? (
//                     <input
//                       type="text"
//                       inputMode="decimal"
//                       pattern="[0-9]*[.]?[0-9]*"
//                       value={formData[idx]?.printOnlyRate || formData[idx]?.rate || ""}
//                       onChange={e => handleChange(idx, "printOnlyRate", e.target.value)}
//                       className="form-control form-control-sm"
//                       style={{ width: "80px" }}
//                     />
//                   ) : (
//                     <span className="ms-2 text-muted">-</span>
//                   )}
//                 </td>
//               ))}
//             </tr>
//             <tr>
//               <td className="text-start fw-bold">CIRCULATION</td>
//               {months.map((_, idx) => (
//                 <td key={idx}>
//                   <input
//                     type="number"
//                     min="0"
//                     value={formData[idx]?.circulation || 0}
//                     onChange={e => handleChange(idx, "circulation", e.target.value)}
//                     className="form-control form-control-sm"
//                     disabled={!formData[idx]?.adSize}
//                   />
//                 </td>
//               ))}
//             </tr>
//           </tbody>
//         </table>
//       </div>
//       <div className="text-end mt-3">
//         <button className="btn btn-primary" onClick={handleSave}>Save Changes</button>
//       </div>
//     </div>
//   );
// }

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getOrder, saveOrderUpdate } from "../api/order";
import { groupRowsForEdit } from "../services/orderEditHelper";
import { buildOrderPayload } from "../services/orderService";
import { getMonthLabelsFrom } from "../utils/dateUtils";
import productTypes from "../data/productTypes.json";
import adSizes from "../data/adSizes.json";
import 'bootstrap/dist/css/bootstrap.min.css';

export default function EditOrder() {
  const { orderId } = useParams();
  const [months, setMonths] = useState([]);
  const [formData, setFormData] = useState([]);
  const [order, setOrder] = useState(null);
  const [printOnlyEnabled, setPrintOnlyEnabled] = useState(Array(14).fill(false));

  // --- Helper Logic ---
  useEffect(() => {
    getOrder(orderId).then(data => {
      const startMonth = data.rows[0]?.MONTH || "MAY 24";
      const monthsArr = getMonthLabelsFrom(startMonth);
      setMonths(monthsArr);
      const baseRows = groupRowsForEdit(data.rows, monthsArr);
      setFormData(
        baseRows.map(row => ({
          ...row,
          quantity:
            (parseInt(row.printOnly) || 0) +
            (parseInt(row.circulation) || 0)
        }))
      );
      setOrder(data.order);
      setPrintOnlyEnabled(
        baseRows.map(row => !!(parseInt(row.printOnly) > 0))
      );
    });
  }, [orderId]);

  // --- Field Updaters ---
  const handleChange = (idx, field, value) => {
    setFormData(old =>
      old.map((row, i) =>
        i === idx ? { ...row, [field]: value } : row
      )
    );
  };

  // QUANTITY updates circulation if printOnly enabled
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

  // PRINT ONLY changes circulation to (quantity - printOnly)
  const handlePrintOnlyChange = (idx, value) => {
    setFormData(old => old.map((row, i) => {
      if (i !== idx) return row;
      const printOnly = parseInt(value) || 0;
      const quantity = parseInt(row.quantity) || 0;
      const circulation = Math.max(quantity - printOnly, 0);
      return { ...row, printOnly, circulation };
    }));
  };

  // Checkbox toggler for Print Only field
  const handlePrintOnlyCheckbox = (idx, checked) => {
    setPrintOnlyEnabled(poArr => {
      const newArr = [...poArr];
      newArr[idx] = checked;
      return newArr;
    });
    setFormData(old => old.map((row, i) => {
      if (i !== idx) return row;
      if (!checked) {
        // Disable print only, reset printOnly to 0 and circulation to quantity
        return {
          ...row,
          printOnly: 0,
          printOnlyRate: row.rate || 0,
          circulation: parseInt(row.quantity) || 0
        };
      }
      // Enable print only; if blank, set both fields
      if (checked && (!row.printOnly || row.printOnly === "")) {
        return {
          ...row,
          printOnly: 0,
          printOnlyRate: row.rate || 0,
          circulation: parseInt(row.quantity) || 0
        };
      }
      return row;
    }));
  };

  const handleSave = async () => {
    if (!order || !months || !Array.isArray(months)) {
        alert("Months array not ready!");
        return;
      }

      console.log(months);

    const payload = buildOrderPayload(
    //   order.OID,
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

    await saveOrderUpdate(payload);
    alert("Order updated!");
  };

  if (!order || formData.length !== months.length) return <div>Loading...</div>;

  return (
    <div className="container">
      <h2 className="mb-4 text-center">Edit Order #{orderId}</h2>
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
                    value={formData[idx]?.rate || ""}
                    onChange={e => handleChange(idx, "rate", e.target.value)}
                    className="form-control form-control-sm"
                    disabled={!formData[idx]?.adSize || !formData[idx]?.productType}
                    style={{ MozAppearance: 'textfield' }}
                  />
                </td>
              ))}
            </tr>
            {/* QUANTITY row */}
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
                    disabled={!formData[idx]?.adSize}
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
                      disabled={!formData[idx]?.adSize}
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
                    className="form-control form-control-sm"
                    disabled={!formData[idx]?.adSize}
                  />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <div className="text-end mt-3">
        <button className="btn btn-primary" onClick={handleSave}>Save Changes</button>
      </div>
    </div>
  );
}
