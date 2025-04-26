// import { useEffect, useState } from "react";
// import axios from "axios";
// import UserTable from "../components/UserTable";

// function DashboardPage() {
//   const [user, setUser] = useState(null);
//   const token = localStorage.getItem("token");

//   useEffect(() => {
//     if (!token) return (window.location.href = "/");

//     axios
//       .get("http://localhost:5000/api/profile", {
//         headers: { Authorization: `Bearer ${token}` },
//       })
//       .then((res) => setUser(res.data.user))
//       .catch(() => {
//         localStorage.removeItem("token");
//         window.location.href = "/";
//       });
//   }, []);

//   if (!user) return <p>Loading...</p>;

//   return (
//     <div>
//       <h2>Welcome, {user.role.toUpperCase()}</h2>
//       <button onClick={() => { localStorage.removeItem("token"); window.location.href = "/"; }}>
//         Logout
//       </button>
//       {user.role === "admin" && <UserTable currentUserId={user.id} />}
//     </div>
//   );
// }

// export default DashboardPage;


import { useEffect, useState } from "react";
import axios from "axios";
import UserTable from "../components/UserTable";
import { Link, useNavigate } from "react-router-dom";

function DashboardPage() {
  const [user, setUser] = useState(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return navigate("/");

    API
      .get("/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUser(res.data.user))
      .catch(() => {
        localStorage.removeItem("token");
        navigate("/");
      });
  }, []);

  if (!user) return <p>Loading...</p>;

  return (
    <div style={{ maxWidth: 800, margin: "2rem auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Welcome, {user.role.toUpperCase()}</h2>
        <button
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/");
          }}
        >
          Logout
        </button>
      </div>

      <nav style={{ margin: "1.5rem 0", display: "flex", gap: "1.5rem" }}>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/orders">Orders</Link>
        {/* Add more links as you add more features */}
      </nav>

      {/* Show admin panel for admins */}
      {user.role === "admin" && <UserTable currentUserId={user.id} />}

      {/* You could add more dashboard widgets/info here */}
    </div>
  );
}

export default DashboardPage;
