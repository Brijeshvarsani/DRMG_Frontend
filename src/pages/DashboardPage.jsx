import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import UserTable from "../components/UserTable";
import CreateUserForm from "../components/CreateUser";
import logo from "../assets/DRMG logo.webp"; // ✅ Import your logo

function DashboardPage() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {

    document.title = "DRMG - Dashboard"; // ✅ Set tab title
    
        const favicon = document.querySelector("link[rel~='icon']");
        if (favicon) {
          favicon.href = logo;
        } else {
          const newFavicon = document.createElement("link");
          newFavicon.rel = "icon";
          newFavicon.href = logo;
          document.head.appendChild(newFavicon);
        }
    

    if (!token) return navigate("/");

    API.get("/profile", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => setUser(res.data.user))
      .catch(() => {
        localStorage.removeItem("token");
        navigate("/");
      });
  }, []);

  // Mock: Load user table data (replace with actual API call in real use)
  useEffect(() => {
    if (user?.role === "admin") {
      fetchUsers();
    }
  }, [user]);

  function fetchUsers() {
    API.get("/users", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => setUsers(res.data))
      .catch((err) => console.error("Failed to load users", err));
  }

  const handleCreateUser = () => {
    alert("Create User clicked (implement your logic here)");
  };

  const handleUpdateUser = (id) => {
    alert(`Update user ${id} clicked (implement your logic here)`);
  };

  const handleDeactivateUser = (id) => {
    alert(`Deactivate user ${id} clicked (implement your logic here)`);
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div className="container my-5">
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
          {/* <Link className="nav-link" to="/dashboard">Dashboard</Link> */}
          <Link className="nav-link" to="/orders">Create Order</Link>
          <Link className="nav-link" to="/order-list">Orders List</Link>
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

      {user.role === "admin" && (
        <UserTable
        users={users.filter((u) => u.id !== user.id)}
        onCreate={handleCreateUser}
        onUpdate={handleUpdateUser}
        onDeactivate={handleDeactivateUser}
      />      
      )}
      <div className="container my-5">
        <CreateUserForm onUserCreated={fetchUsers} />
      </div>
    </div>
  );
}

export default DashboardPage;
