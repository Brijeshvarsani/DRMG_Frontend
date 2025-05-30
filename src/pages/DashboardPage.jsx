import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import UserTable from "../components/UserTable";
import CreateUserForm from "../components/CreateUser";
import logo from "../assets/DRMG logo.webp"; // ✅ Import your logo
import Header from "../components/Header";

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
      <Header user={user} /> 
      {user.role === "admin" && (
        <div className="container my-5">
          <UserTable
            users={users.filter((u) => u.id !== user.id)}
            onCreate={handleCreateUser}
            onUpdate={handleUpdateUser}
            onDeactivate={handleDeactivateUser}
            />
          <CreateUserForm onUserCreated={fetchUsers} />
        </div>
      )}
    </div>
  );
}

export default DashboardPage;
