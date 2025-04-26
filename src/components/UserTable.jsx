import { useEffect, useState } from "react";
import axios from "axios";

function UserTable({ currentUserId }) {
  const [users, setUsers] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUser, setNewUser] = useState({
    email: "",
    username: "",
    password: "",
    role: "user"
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, []);

  const fetchUsers = () => {
    axios.get("http://localhost:5000/api/users", {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setUsers(res.data));
  };

  const updateUser = (id) => {
    const email = document.getElementById(`email-${id}`).value;
    const username = document.getElementById(`username-${id}`).value;
    const role = document.getElementById(`role-${id}`).value;
    const password = document.getElementById(`password-${id}`).value;

    const updateData = { email, username, role };
    if (password.trim() !== "") updateData.password = password;

    axios.put(`http://localhost:5000/api/users/${id}`, updateData, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(() => fetchUsers());
  };

  const deactivateUser = (id) => {
    if (window.confirm("Are you sure you want to deactivate this user?")) {
      axios.delete(`http://localhost:5000/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(() => fetchUsers());
    }
  };

  // --- Create User Logic ---

  const handleCreateInput = (e) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value });
  };

  const createUser = () => {
    if (!newUser.email || !newUser.username || !newUser.password) {
      alert("All fields required!");
      return;
    }
    axios.post("http://localhost:5000/api/users", newUser, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => {
        setShowCreateForm(false);
        setNewUser({ email: "", username: "", password: "", role: "user" });
        fetchUsers();
      })
      .catch(err => alert(err.response?.data?.message || "Failed to create user"));
  };

  return (
    <div>
      <h3>Admin Panel</h3>
      <button onClick={() => setShowCreateForm(v => !v)}>
        {showCreateForm ? "Cancel" : "Create User"}
      </button>
      {showCreateForm && (
        <div style={{ margin: "1em 0" }}>
          <input
            name="email"
            value={newUser.email}
            onChange={handleCreateInput}
            placeholder="Email"
          />
          <input
            name="username"
            value={newUser.username}
            onChange={handleCreateInput}
            placeholder="Username"
          />
          <input
            name="password"
            value={newUser.password}
            onChange={handleCreateInput}
            type="password"
            placeholder="Password"
          />
          <select
            name="role"
            value={newUser.role}
            onChange={handleCreateInput}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <button onClick={createUser}>Submit</button>
        </div>
      )}

      <table>
        <thead>
          <tr>
            <th>ID</th><th>Email</th><th>Username</th><th>Role</th><th>Password</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.filter(u => u.id !== currentUserId).map(user => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td><input id={`email-${user.id}`} defaultValue={user.email} /></td>
              <td><input id={`username-${user.id}`} defaultValue={user.username} /></td>
              <td>
                <select id={`role-${user.id}`} defaultValue={user.role}>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
              <td><input type="password" id={`password-${user.id}`} placeholder="(leave blank)" /></td>
              <td>
                <button onClick={() => updateUser(user.id)}>Update</button>
                <button onClick={() => deactivateUser(user.id)} style={{ color: "red" }}>Deactivate</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UserTable;
