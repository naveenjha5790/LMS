import React, { useState, useEffect } from "react";
import { Table, Form, Button, Row, Col, Alert, Spinner, Pagination, Container, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
export default function ListAssignments({ curUser,isStudent }) {
  const [loading, setLoading] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [alertMessage, setAlertMessage] = useState({ type: "", text: "" });
  
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [meta, setMeta] = useState({ totalRecords: 0, totalPages: 1 });
    const navigate=useNavigate();
  const fetchAssignments = async (pageNumber, currentSearch) => {
    if (!curUser) return;
    setLoading(true);
    setAlertMessage({ type: "", text: "" });

    try {
      const queryParams = new URLSearchParams({
        page: String(pageNumber),
        limit: "5"
      });

      if (currentSearch.trim()) {
        queryParams.append("search", currentSearch.trim());
      }

      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/assignedPaths?${queryParams.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch active learning path assignments registry.");
      }

      setAssignments(data.paths || []);
      setMeta({
        totalRecords: data.meta?.total_records || 0,
        totalPages: data.meta?.total_pages || 1
      });

    } catch (error) {
      setAlertMessage({
        type: "danger",
        text: error.message || "An unexpected error occurred while parsing assignments ledger."
      });
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments(currentPage, search);
  }, [currentPage]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchAssignments(1, search);
  };
  
const handleBackToDashboard = () => {
    if (isStudent) {
      navigate("/studentDashboard");
    } else {
      navigate("/getPaths"); 
    }
  };
  return (
    <Container className="py-4">
        <div className="mb-3">
        <Button 
          variant="outline-secondary" 
          size="sm" 
          onClick={handleBackToDashboard}
          className="fw-semibold shadow-2xs"
        >
          ← Back to Dashboard
        </Button>
      </div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Assigned Paths Workspace</h2>
          <p className="text-muted small">Tracking system-wide manager distributions of live tracks to student rosters.</p>
        </div>
      </div>

      {alertMessage.text && (
        <Alert variant={alertMessage.type} dismissible onClose={() => setAlertMessage({ type: "", text: "" })}>
          {alertMessage.text}
        </Alert>
      )}

      <Form onSubmit={handleSearchSubmit} className="mb-4 bg-light p-3 border rounded shadow-2xs">
        <Row className="g-2">
          <Col md={9}>
            <Form.Control
              type="text"
              placeholder="Search assignments by student email or course title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Col>
          <Col md={3} className="d-grid">
            <Button variant="primary" type="submit">Search Ledger</Button>
          </Col>
        </Row>
      </Form>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted">Synchronizing assignment records...</p>
        </div>
      ) : assignments.length === 0 ? (
        <Alert variant="info" className="text-center">No active student learning path mappings found matching criteria.</Alert>
      ) : (
        <>
          <Table responsive hover bordered className="align-middle bg-white rounded shadow-sm">
            <thead className="table-light">
              <tr>
                <th>Student Roster Name</th>
                <th>Email Identifier</th>
                <th>Assigned Course Path</th>
                <th>Status Context</th>
                <th>Assigned Date</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((item, index) => (
                <tr key={item.id || index}>
                  <td className="fw-bold">{item.student?.name || "Unassigned/Profile Incomplete"}</td>
                  <td className="text-muted small">{item.student?.email || "N/A"}</td>
                  <td className="text-primary fw-semibold">{item.learningPath?.title || "Missing Learning Path Reference"}</td>
                  <td>
                    <Badge bg={item.learningPath?.status === "PUBLISHED" ? "success" : "secondary"}>
                      {item.learningPath?.status || "UNKNOWN"}
                    </Badge>
                  </td>
                  <td className="small text-muted">
                    {item.assignedAt ? new Date(item.assignedAt).toLocaleDateString() : "Just Now"}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

 
          {meta.totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <Pagination>
                <Pagination.Prev disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} />
                {[...Array(meta.totalPages)].map((_, idx) => (
                  <Pagination.Item 
                    key={idx + 1} 
                    active={idx + 1 === currentPage}
                    onClick={() => setCurrentPage(idx + 1)}
                  >
                    {idx + 1}
                  </Pagination.Item>
                ))}
                <Pagination.Next disabled={currentPage === meta.totalPages} onClick={() => setCurrentPage(prev => prev + 1)} />
              </Pagination>
            </div>
          )}
        </>
      )}
    </Container>
  );
}
