import React, { useState, useEffect } from "react";
import { Table, Button, Spinner, Alert, Modal, Form } from "react-bootstrap";

/**
 * 
 * 
 * @param {Function} onSetGlobalAlert - Bubbles notification messages up to the main dashboard container
 */
export default function PendingTopicsApproval({ onSetGlobalAlert }) {
  const [showPanel, setShowPanel] = useState(false);
  const [pendingList, setPendingList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);


  const [alert, setAlert] = useState({ type: "", text: "" });


  const [showRejectModal, setShowRejectModal] = useState(false);
  const [activeTopicId, setActiveTopicId] = useState(null);
  const [reasonText, setReasonText] = useState("");

  const fetchPendingTopics = async () => {
    setLoading(true);
    setAlert({ type: "", text: "" });
    try {
      const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:5000/api/pendingTopics", {
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
        setAlert({ type: "danger", text: data.message || "Failed to load topic audit streams." });
      }
    } catch (err) {
      console.error(err);
      setAlert({ type: "danger", text: "Network connection loss detected while fetching workflows." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showPanel) {
      fetchPendingTopics();
    }
  }, [showPanel]);
  useEffect(() => {
  if (alert.text) {
  
    const timer = setTimeout(() => {
      setAlert({ type: "", text: "" });
    }, 4000);


    return () => clearTimeout(timer);
  }
}, [alert.text]);

  const handleTopicAction = async (topicId, actionType, textPayload = "") => {
    setProcessingId(topicId);
    setAlert({ type: "", text: "" });

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`http://localhost:5000/api/${topicId}/response`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: actionType,
          reason: textPayload,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        const customMessage = data.message || "Topic workflow updated successfully.";
        setAlert({ type: "success", text: customMessage });
        if (onSetGlobalAlert) onSetGlobalAlert({ type: "success", text: customMessage });

        setPendingList((prev) => prev.filter((t) => t.id !== topicId));
      } else {
        setAlert({ type: "danger", text: data.message || "Action request rejected by server." });
      }
    } catch (err) {
      console.error(err);
      setAlert({ type: "danger", text: "Network transmission failure while submitting evaluation." });
    } finally {
      setProcessingId(null);
    }
  };

  const launchRejectionWindow = (topicId) => {
    setActiveTopicId(topicId);
    setReasonText("");
    setShowRejectModal(true);
  };

  const handleRejectionFormSubmit = (e) => {
    e.preventDefault();
    if (!reasonText.trim()) return;
    setShowRejectModal(false);
    handleTopicAction(activeTopicId, "reject", reasonText.trim());
  };
  return (
  <div className="mb-4">

    <Button 
      variant={showPanel ? "secondary" : "info"}
      onClick={() => { setShowPanel(!showPanel); setAlert({ type: "", text: "" }); }}
      className="fw-bold px-4 text-white text-xs shadow-3xs"
      style={{ borderRadius: "8px", padding: "10px 20px" }}
    >
      {showPanel ? "📁 Hide Pending Topic Content" : "📽️ View Pending Topic Content"}
    </Button>

    {alert.text && (
      <Alert variant={alert.type} onClose={() => setAlert({ type: "", text: "" })} dismissible className="text-xs shadow-3xs mt-3">
        {alert.text}
      </Alert>
    )}

    {showPanel && (
      <div 
        className="mt-3"
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          border: "1px solid #e2e8f0",
          padding: "20px",
          boxShadow: "0 12px 32px rgba(0, 0, 0, 0.05)",
          overflow: "hidden"
        }}
      >
        <h5 className="fw-bold text-dark mb-3 text-xs uppercase tracking-wider" style={{ color: "#334155" }}>
          Incoming Topic Content Review Queue:
        </h5>
        
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="info" className="me-2" size="sm" />
            <span className="text-muted text-xs">Syncing structural modules logs...</span>
          </div>
        ) : pendingList.length === 0 ? (
          <div className="text-center py-4 text-muted small fst-italic border rounded border-dashed bg-light/50">
            Clear! No module video or quiz payloads are currently awaiting verification.
          </div>
        ) : (
          <Table responsive borderless className="align-middle text-sm mb-0">
            <thead>
              <tr className="text-uppercase text-secondary border-bottom" style={{ fontSize: "11px", fontWeight: "700", backgroundColor: "#f8fafc" }}>
                <th className="ps-4 py-3" style={{ borderTopLeftRadius: "8px", borderBottomLeftRadius: "8px" }}>Hierarchy Context Path</th>
                <th className="py-3">Topic Title Node</th>
                <th className="text-center pe-4 py-3" style={{ borderTopRightRadius: "8px", borderBottomRightRadius: "8px" }}>Review Execution</th>
              </tr>
            </thead>
            <tbody>
              {pendingList.map((topic) => {
                const pathTitle = topic.chapter?.subject?.learningPath?.title || "Unknown Path";
                const subjectTitle = topic.chapter?.subject?.title || "Unknown Subject";
                const chapterTitle = topic.chapter?.title || "Unknown Chapter";

                return (
                  <tr 
                    key={topic.id} 
                    style={{ transition: "all 0.2s ease-in-out", borderBottom: "1px solid #f1f5f9" }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#f8fafc"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                  >
                  
                    <td className="ps-4 py-3.5">
                      <div className="text-primary fw-semibold" style={{ fontSize: "12px" }}>{pathTitle}</div>
                      <div className="text-secondary text-[11px] mt-0.5">📚 {subjectTitle} ➔ 📖 {chapterTitle}</div>
                    </td>

             
                    <td className="py-3.5">
                      <div style={{ fontWeight: "600", color: "#0f172a", fontSize: "14px" }}>🔹 {topic.title}</div>
                      <small className="text-muted font-mono text-[10px]">ID: {topic.id}</small>
                    </td>

                    <td className="pe-4 py-3.5">
                      <div className="d-flex gap-2 justify-content-center">
                        <Button
                          variant="success"
                          size="sm"
                          disabled={processingId !== null}
                          onClick={() => handleTopicAction(topic.id, "approved")}
                          style={{ fontSize: "12px", fontWeight: "600", padding: "6px 14px", borderRadius: "8px" }}
                        >
                          {processingId === topic.id ? "Saving..." : "Approve"}
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          disabled={processingId !== null}
                          onClick={() => launchRejectionWindow(topic.id)}
                          style={{ fontSize: "12px", fontWeight: "600", padding: "6px 14px", borderRadius: "8px" }}
                        >
                          Reject
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </div>
    )}


    <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)} centered size="sm">
      <Modal.Header closeButton className="bg-light">
        <Modal.Title className="fw-bold text-dark text-xs">⚠️ Content Rejection Reason</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleRejectionFormSubmit}>
        <Modal.Body>
          <Form.Group>
            <Form.Label className="text-muted small">Specify modification requirements for content creators:</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="e.g., Video presentation audio has severe echo issues or quiz option keys contain typos."
              value={reasonText}
              onChange={(e) => setReasonText(e.target.value)}
              required
              className="text-xs"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="bg-light py-2">
          <Button variant="secondary" size="sm" onClick={() => setShowRejectModal(false)}>Cancel</Button>
          <Button variant="danger" type="submit" size="sm" className="fw-semibold">Submit Rejection</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  </div>
);
}
