import React from "react";
import ChangeRoleModal from "./changeRole";

export default function ListUsers({ usersList, setUsersList }) {
  
  const handleLocalRoleStateMutation = (targetEmail, updatedRoleValue) => {
    if (setUsersList) {
      setUsersList((prevUsers) =>
        prevUsers.map((u) =>
          u.email === targetEmail ? { ...u, role: updatedRoleValue } : u
        )
      );
    }
  };

  return (
    <table className="table align-middle">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email Address</th>
          <th>Current Privilege Scale</th>
          <th className="text-end">Administrative Management Tools</th>
        </tr>
      </thead>
      <tbody>
        {Array.isArray(usersList) && usersList.map((user) => (
          <tr key={user.id || user.email}>
            <td className="fw-semibold">{user.name}</td>
            <td>{user.email}</td>
            <td>
              <span className={`badge ${user.role === "ADMIN" ? "bg-dark" : "bg-secondary"}`}>
                {user.role}
              </span>
            </td>
            <td className="text-end">

              {user.role !== "ADMIN" ? (
                <ChangeRoleModal 
                  userItem={user} 
                  onRoleUpdateSuccess={handleLocalRoleStateMutation}
                />
              ) : (
                <span className="text-muted small text-xs italic">System Sovereign</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
