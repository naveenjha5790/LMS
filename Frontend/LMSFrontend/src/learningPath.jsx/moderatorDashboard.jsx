import React, { useState, useEffect } from "react";
import { Button, Table, Spinner, Alert, Modal, Form } from "react-bootstrap";
import PendingTopicsApproval from "../topic/moderatorResponse";
export default function ModeratorDashboard() {
  const [showPending, setShowPending] = useState(false);
  const [pendingList, setPendingList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null); // Track specific path processing

  // Alerts System
  const [alert, setAlert] = useState({ type: "", text: "" });

  // Rejection Modal Tracking States
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [activePathId, setActivePathId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  // 1. Fetch paths using your pendingPaths backend controller
  const fetchPendingPaths = async () => {
    setLoading(true);
    setAlert({ type: "", text: "" });
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/paths/pending", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (res.ok) {
        setPendingList(data || []);
      } else {
        setAlert({ type: "danger", text: data.message || "Failed to load workflow items." });
      }
    } catch (err) {
      console.error(err);
      setAlert({ type: "danger", text: "Network connection loss detected." });
    } finally {
      setLoading(false);
    }
  };

  // Trigger loading automatically when toggled open
  useEffect(() => {
    if (showPending) {
      fetchPendingPaths();
    }
  }, [showPending]);

  // 2. Submit responses to your moderatorResponse backend controller
  const handleModeratorAction = async (pathId, actionType, reasonText = "") => {
    setActionLoading(pathId);
    setAlert({ type: "", text: "" });

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/paths/r${pathId}/approvalPending`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: actionType, // 'approved' or 'reject'
          reason: reasonText,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setAlert({ type: "success", text: data.message || "Action updated successfully!" });
        // Hot-remove item from current list immediately upon action resolution
        setPendingList((prev) => prev.filter((item) => item.id !== pathId));
      } else {
        setAlert({ type: "danger", text: data.message || "Server rejected this action." });
      }
    } catch (err) {
      console.error(err);
      setAlert({ type: "danger", text: "Failed to dispatch command to server." });
    } finally {
      setActionLoading(null);
    }
  };

  const openRejectWindow = (pathId) => {
    setActivePathId(pathId);
    setRejectReason("");
    setShowRejectModal(true);
  };

  const submitRejectionForm = (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) return;
    setShowRejectModal(false);
    handleModeratorAction(activePathId, "reject", rejectReason.trim());
  };

  return (
  <div className="container mt-4">
    {/* Header Action Banner */}
    <div className="bg-light p-4 rounded-3 border mb-4 shadow-sm">
      <h2 className="fw-bold text-dark mb-3">Moderator Workspace Dashboard</h2>
      <p className="text-muted small">Review incoming curriculum schemas and final releases submitted by workspace managers and content contributors.</p>
      
      {/* Layout Control Triggers Grid Row */}
      <div className="d-flex flex-wrap gap-3">
        <Button 
          variant={showPending ? "secondary" : "warning"}
          onClick={() => setShowPending(!showPending)}
          className="fw-bold px-4 shadow-3xs text-xs"
        >
          {showPending ? "📁 Hide Pending Pathways" : "🔍 View Pending Pathways"}
        </Button>

        {/* ─── INJECTED: INDEPENDENT TOPIC APPROVAL ACTIONS TRIGGER ─── */}
        <PendingTopicsApproval onSetGlobalAlert={(alertObj) => setAlert(alertObj)} />
      </div>
    </div>

    {alert.text && (
      <Alert variant={alert.type} onClose={() => setAlert({ type: "", text: "" })} dismissible className="text-xs shadow-3xs">
        {alert.text}
      </Alert>
    )}

    {/* Expanded Review Screen Layer for Learning Paths Structure */}
    {showPending && (
      <div className="bg-white p-3 border rounded-3 shadow-sm mb-4">
        <h4 className="fw-bold text-secondary mb-3 small uppercase tracking-wider">Awaiting Structural Integrity Check:</h4>
        
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="warning" className="me-2" />
            <span className="text-muted small">Retrieving audit queues...</span>
          </div>
        ) : pendingList.length === 0 ? (
          <div className="text-center py-4 text-muted small fst-italic border rounded border-dashed bg-light/50">
            Clear! No learning pathways are currently awaiting verification.
          </div>
        ) : (
          <div 
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              border: "1px solid #e2e8f0",
              padding: "20px",
              boxShadow: "0 12px 32px rgba(0, 0, 0, 0.05)",
              overflow: "hidden"
            }}
          >
            <Table responsive borderless className="text-sm mb-0 align-middle">
              <thead>
                <tr 
                  className="text-uppercase text-secondary border-bottom" 
                  style={{ 
                    fontSize: "14px", 
                    fontWeight: "700", 
                    letterSpacing: "0.05em",
                    backgroundColor: "#f8fafc"
                  }}
                >
                  <th className="ps-4 py-3" style={{ borderTopLeftRadius: "8px", borderBottomLeftRadius: "8px" }}>Path Title</th>
                  <th className="py-3 ps-4">Current Queue Status</th>
                  <th className="text-center ps-4 py-3" style={{ borderTopRightRadius: "8px", borderBottomRightRadius: "8px" }}>Action Controls</th>
                </tr>
              </thead>
              <tbody>
                {pendingList.map((path) => (
                  <tr 
                    key={path.id} 
                    style={{ 
                      transition: "all 0.2s ease-in-out",
                      borderBottom: "1px solid #f1f5f9"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#f8fafc";
                      e.currentTarget.style.transform = "scale(1.002)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  >
                    <td className="ps-4 py-4">
                      <div style={{ fontWeight: "600", color: "#0f172a", fontSize: "16px" }}>
                        {path.title}
                      </div>
                      <div className="font-mono text-muted mt-1" style={{ fontSize: "11px", letterSpacing: "0.02em" }}>
                        ID: {path.id}
                      </div>
                    </td>

                    <td className="py-4">
                      <span 
                        className="badge border" 
                        style={{ 
                          padding: "6px 12px", 
                          fontSize: "11px", 
                          fontWeight: "600",
                          borderRadius: "30px",
                          letterSpacing: "0.02em",
                          backgroundColor: path.status === "PENDING_STRUCTURE_APPROVAL" ? "#fffbeb" : "#f0f9ff",
                          color: path.status === "PENDING_STRUCTURE_APPROVAL" ? "#b45309" : "#0369a1",
                          borderColor: path.status === "PENDING_STRUCTURE_APPROVAL" ? "#fde68a" : "#bae6fd"
                        }}
                      >
                        {path.status?.replace(/_/g, " ")}
                      </span>
                    </td>

                    <td className="pe-4 py-4">
                      <div className="d-flex gap-2 justify-content-center align-items-center">
                        <Button
                          variant="success"
                          size="sm"
                          disabled={actionLoading !== null}
                          onClick={() => handleModeratorAction(path.id, "approved")}
                          style={{ 
                            fontSize: "12px", 
                            fontWeight: "600", 
                            padding: "8px 16px",
                            borderRadius: "8px",
                            boxShadow: "0 2px 6px rgba(25, 135, 84, 0.15)",
                            transition: "all 0.15s ease"
                          }}
                        >
                          {actionLoading === path.id ? (
                            <>
                              <Spinner animation="border" size="sm" className="me-1" />
                              Syncing...
                            </>
                          ) : "Approve"}
                        </Button>
                        
                        <Button
                          variant="danger"
                          size="sm"
                          disabled={actionLoading !== null}
                          onClick={() => openRejectWindow(path.id)}
                          style={{ 
                            fontSize: "12px", 
                            fontWeight: "600", 
                            padding: "8px 16px",
                            borderRadius: "8px",
                            boxShadow: "0 2px 6px rgba(220, 53, 69, 0.15)",
                            transition: "all 0.15s ease"
                          }}
                        >
                          Reject
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </div>
    )}

    {/* SUB-MODAL INTERFACE FOR INJECTING CUSTOM REJECTION REASONS */}
    <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)} centered size="sm">
      <Modal.Header closeButton className="bg-light">
        <Modal.Title className="fw-bold text-dark text-xs">⚠️ Rejection Context Reason</Modal.Title>
      </Modal.Header>
      <Form onSubmit={submitRejectionForm}>
        <Modal.Body>
          <Form.Group>
            <Form.Label className="text-muted small">Provide modification details for the manager:</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="e.g., Chapter order sequence contains empty fields or missing topics mapping."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              required
              className="text-xs"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="bg-light py-2">
          <Button variant="secondary" size="sm" onClick={() => setShowRejectModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" type="submit" size="sm" className="fw-semibold">
            Submit Rejection
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  </div>
);

}
