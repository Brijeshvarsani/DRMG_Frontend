import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import OrderTable from "./components/OrderTable";
import EditOrder from "./pages/EditOrder";
import OrderList from "./components/OrderList";
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
        <Route path="/order-list" element={
          <ProtectedRoute>
            <OrderList />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
