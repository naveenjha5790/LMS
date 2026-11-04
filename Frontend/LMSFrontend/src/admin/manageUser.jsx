import React, { useState, useEffect } from "react";
import { Spinner, Alert, Container } from "react-bootstrap";
import ListUsers from "./listUsers"; 

export default function ManageUser() {
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/users", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        const data = await res.json();
        if (res.ok) {
          setUsersList(data.users || data.data || (Array.isArray(data) ? data : []));
        } else {
          setError(data.message || "Failed to load system directory entries.");
        }
      } catch (err) {
        console.error(err);
        setError("Network connection failed while synchronizing profiles.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <Container className="py-3">
      {loading && (
        <div className="text-center py-4">
          <Spinner animation="border" variant="primary" />
          <p className="text-muted small mt-2">Loading system profiles directory...</p>
        </div>
      )}
      {error && <Alert variant="danger" className="text-center small">{error}</Alert>}
      {!loading && !error && (
        <ListUsers usersList={usersList} setUsersList={setUsersList} />
      )}
    </Container>
  );
}
