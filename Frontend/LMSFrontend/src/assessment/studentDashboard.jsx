import React from "react";
import { Card, Button, Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export default function StudentDashboard({ curUser }) {
  const navigate = useNavigate();

  return (
    <Container className="d-flex justify-content-center align-items-center py-5">
      <Card style={{ width: "400px" }} className="text-center shadow-sm border p-4 bg-white rounded">
        <Card.Body>
          <div className="fs-1 mb-3">🎓</div>
          <Card.Title className="fw-bold fs-4 mb-2">Student Dashboard Workspace</Card.Title>
          <Card.Text className="text-muted small mb-4">
            Welcome back! You can access all your active assigned learning paths and progress evaluations below.
          </Card.Text>
          
      
          <Button 
            variant="success" 
            className="w-100 py-3 fw-bold shadow-xs"
            onClick={() => navigate("/assignments")}
            style={{ fontSize: "1.1rem" }}
          >
            📝 View Assignments
          </Button>
        </Card.Body>
      </Card>
    </Container>
  );
}
