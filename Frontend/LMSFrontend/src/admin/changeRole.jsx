import React, { useState } from "react";
import { Button, Modal, Form, Spinner, Alert } from "react-bootstrap";

export default function ChangeRoleModal({ userItem, onRoleUpdateSuccess }) {
  const [showModal, setShowModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(userItem?.role || "STUDENT");
  const [submitting, setSubmitting] = useState(false);
  const [alertMsg, setAlertMsg] = useState({ type: "", text: "" });

  const rolesCatalog = ["LMS_MANAGER", "MODERATOR", "CONTRIBUTOR", "STUDENT"];

  const handleRoleSubmit = async (e) => {
    e.preventDefault();
    if (selectedRole === userItem?.role) {
      setShowModal(false);
      return;
    }

    setSubmitting(true);
    setAlertMsg({ type: "", text: "" });

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/changeRole", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          email: userItem.email,
          newRole: selectedRole
        })
      });

      const data = await res.json();

      if (res.ok) {
        setShowModal(false);
        if (onRoleUpdateSuccess) {
          onRoleUpdateSuccess(userItem.email, selectedRole);
        }
      } else {
        setAlertMsg({ type: "danger", text: data.message || "Failed to update role profile parameters." });
      }
    } catch (err) {
      console.error(err);
      setAlertMsg({ type: "danger", text: "Failed to establish secure server data sync links." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Button 
        variant="outline-warning" 
        size="sm" 
        className="fw-semibold text-xs py-1"
        onClick={() => {
          setSelectedRole(userItem?.role || "STUDENT");
          setAlertMsg({ type: "", text: "" });
          setShowModal(true);
        }}
      >
        ⚙️ Change Role
      </Button>

      <Modal show={showModal} onHide={() => !submitting && setShowModal(false)} centered>
        <Form onSubmit={handleRoleSubmit}>
          <Modal.Header closeButton={!submitting}>
            <Modal.Title className="fs-5 fw-bold">Modify Authorization Context</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {alertMsg.text && <Alert variant={alertMsg.type} className="small py-2">{alertMsg.text}</Alert>}
            
            <div className="mb-3 small">
              Target User: <strong className="text-dark">{userItem?.name || "N/A"}</strong>
              <div className="text-muted text-xs">{userItem?.email}</div>
            </div>

            <Form.Group>
              <Form.Label className="small fw-semibold">Select Assigned System Role</Form.Label>
              <Form.Select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                disabled={submitting}
              >
                {rolesCatalog.map((r) => (
                  <option key={r} value={r}>{r.replace("_", " ")}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" size="sm" onClick={() => setShowModal(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={submitting}>
              {submitting ? <Spinner size="sm" animation="border" /> : "Save Changes"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}
