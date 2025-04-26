// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import LoginPage from "./pages/LoginPage";
// import DashboardPage from "./pages/DashboardPage";

// function App() {
//   return (
//     <Router>
//       <Routes>
//         <Route path="/" element={<LoginPage />} />
//         <Route path="/dashboard" element={<DashboardPage />} />

//         {/* <Route path="/order" element={<ProtectedRoute><OrderPage /></ProtectedRoute>} /> */}
//       </Routes>
//     </Router>
//   );
// }

// export default App;

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import OrderTable from "./components/OrderTable";
import EditOrder from "./pages/EditOrder";
import ProtectedRoute from "./components/ProtectedRoute";

import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<LoginPage />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />
        <Route path="/orders" element={
          <ProtectedRoute>
            <OrderTable />
          </ProtectedRoute>
        } />
        <Route path="/edit-order/:orderId" element={
          <ProtectedRoute>
            <EditOrder />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
