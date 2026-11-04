import React, { useState, useEffect } from "react";
import { Button, Modal, Form, Spinner, Alert } from "react-bootstrap";

export default function AssignPathModal({ pathItem, onSuccess }) {
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submittingAssignment, setSubmittingAssignment] = useState(false);
  const [alert, setAlert] = useState({ type: "", text: "" });

  useEffect(() => {
    if (alert.text) {
      const timer = setTimeout(() => setAlert({ type: "", text: "" }), 4000);
      return () => clearTimeout(timer);
    }
  }, [alert.text]);

  const openAssignModal = async () => {
    setShowAssignModal(true);
    setLoadingStudents(true);
    setAlert({ type: "", text: "" });
    setSelectedStudentId("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/student", { 
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (res.ok) {

  const extractedStudents = Array.isArray(data) 
    ? data 
    : (data.students || data.data || []);
    
  setStudents(extractedStudents);
} else {
  setAlert({ type: "danger", text: data.message || "Failed to load students list." });
}
    } catch (err) {
      console.error(err);
      setAlert({ type: "danger", text: "Network error loading student profiles." });
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudentId) return;

    setSubmittingAssignment(true);
    setAlert({ type: "", text: "" });

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/${pathItem.id}/assign`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ studentId: selectedStudentId }),
      });

      const data = await res.json();

      if (res.ok) {
        setShowAssignModal(false);
        if (onSuccess) onSuccess(`Successfully assigned "${pathItem.title}"! 🚀`);
      } else {
        setAlert({ type: "danger", text: data.message || "Failed to assign learning path." });
      }
    } catch (err) {
      console.error(err);
      setAlert({ type: "danger", text: "Server connection failure." });
    } finally {
      setSubmittingAssignment(false);
    }
  };

  return (
    <>
     
      {alert.text && (
        <Alert 
          variant={alert.type} 
          onClose={() => setAlert({ type: "", text: "" })} 
          dismissible
          style={{ position: 'fixed', top: '24px', right: '24px', zIndex: 1200, minWidth: '300px' }}
        >
          {alert.text}
        </Alert>
      )}

      <Button variant="success" size="sm" className="fw-semibold" onClick={openAssignModal}>
        Assign Path
      </Button>

      <Modal show={showAssignModal} onHide={() => setShowAssignModal(false)} centered>
        <Form onSubmit={handleAssignSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>Assign Learning Path</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p className="small text-muted mb-3">
              Assigning path: <strong>{pathItem?.title}</strong>
            </p>

            {loadingStudents ? (
              <div className="text-center py-3">
                <Spinner animation="border" size="sm" variant="primary" className="me-2" />
                <span>Gathering Student roster profiles...</span>
              </div>
            ) : students.length === 0 ? (
              <p className="text-danger small">No student accounts registered in system core profiles.</p>
            ) : (
              <Form.Group>
                <Form.Select
  required
  value={selectedStudentId}
  onChange={(e) => setSelectedStudentId(e.target.value)}
>
  <option value="">-- Choose a student from registry --</option>
  

  {Array.isArray(students) && students.map((student) => (
    <option key={student.id} value={student.id}>
      {student.name || student.email} ({student.email})
    </option>
  ))}
</Form.Select>
              </Form.Group>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAssignModal(false)} disabled={submittingAssignment}>
              Cancel
            </Button>
            <Button 
              variant="success" 
              type="submit" 
              disabled={!selectedStudentId || submittingAssignment || loadingStudents}
            >
              {submittingAssignment ? <Spinner size="sm" animation="border" /> : "Confirm Assignment"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}
