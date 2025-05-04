import { useState } from "react";
import API from "../services/api";

export default function CreateUserForm({ onUserCreated }) {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    role: "user",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const res = await API.post("/users", formData); // Adjust route if needed
      onUserCreated(res.data); // Refresh user list in parent
      setSuccessMsg("User created successfully!");
      setFormData({ email: "", username: "", role: "user", password: "" });
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to create user.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card p-3 mb-4 shadow-sm">
      <h5 className="mb-3">Create New User</h5>

      {successMsg && <div className="alert alert-success">{successMsg}</div>}
      {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

      <div className="row g-3">
        <div className="col-md-6">
          <input
            type="email"
            name="email"
            className="form-control"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-md-6">
          <input
            type="text"
            name="username"
            className="form-control"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-md-6">
          <select
            name="role"
            className="form-select"
            value={formData.role}
            onChange={handleChange}
            required
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="col-md-6">
          <input
            type="password"
            name="password"
            className="form-control"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="mt-3 text-end">
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create User"}
        </button>
      </div>
    </form>
  );
}
