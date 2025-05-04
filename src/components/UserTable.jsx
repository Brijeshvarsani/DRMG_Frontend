import React from "react";

export default function UserTable({ users = [], onCreate, onUpdate, onDeactivate }) {
  return (
    <div className="card shadow-sm mt-4">
      <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Admin Panel</h5>
      </div>

      <div className="card-body">
        <table className="table table-bordered table-sm align-middle text-center">
          <thead className="table-light">
            <tr>
              <th>ID</th>
              <th>Email</th>
              <th>Username</th>
              <th>Role</th>
              <th>Password</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, idx) => (
              <tr key={idx}>
                <td>{user.id}</td>
                <td>
                  <input
                    type="email"
                    defaultValue={user.email}
                    className="form-control form-control-sm"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    defaultValue={user.username}
                    className="form-control form-control-sm"
                  />
                </td>
                <td>
                  <select defaultValue={user.role} className="form-select form-select-sm">
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
                  </select>
                </td>
                <td>
                  <input
                    type="password"
                    className="form-control form-control-sm"
                    placeholder="(leave blank)"
                  />
                </td>
                <td>
                  <button
                    className="btn btn-success btn-sm me-2"
                    onClick={() => onUpdate(user.id)}
                  >
                    Update
                  </button>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => onDeactivate(user.id)}
                  >
                    Deactivate
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
