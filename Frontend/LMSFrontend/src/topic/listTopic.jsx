import React, { useState, useEffect, useCallback } from "react";
import { Table, Form, Button, Pagination, Spinner, Alert, Badge, Row, Col } from "react-bootstrap";

export default function ListTopics({ curUser, chapterId, topics, setTopics }) {
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState({ type: "", text: "" });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

 
  const [currentPage, setCurrentPage] = useState(1);
  const [meta, setMeta] = useState({ totalRecords: 0, totalPages: 1 });


  const userRole = curUser?.role?.toUpperCase()?.trim() || "";
  const isManager = userRole === "LMS_MANAGER" || userRole === "MANAGER";

 
  const fetchTopics = useCallback(async (pageNumber = 1) => {
    if (!chapterId) return;
    setLoading(true);
    setAlertMessage({ type: "", text: "" });

    try {
      const queryParams = new URLSearchParams({
        page: pageNumber.toString(),
        limit: "5", 
      });

      if (statusFilter) queryParams.append("status", statusFilter);
      if (search.trim()) queryParams.append("search", search.trim());

      const token = localStorage.getItem("token");


      const response = await fetch(`http://localhost:5000/api/chapters/${chapterId}/topics?${queryParams.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Failed to load topics");
      }
      if (setTopics) {
        setTopics(data.paths || []);
      }
      setMeta({
        totalRecords: data.meta?.total_records || 0,
        totalPages: data.meta?.total_pages || 1,
      });
      setCurrentPage(data.meta?.current_page || pageNumber);

    } catch (error) {
      setAlertMessage({
        type: "danger",
        text: error.message || "An unexpected error occurred while loading topic workspace sheets.",
      });
      if (setTopics) setTopics([]);
    } finally {
      setLoading(false);
    }
  }, [chapterId, statusFilter, search, setTopics]);

  useEffect(() => {
    fetchTopics(currentPage);
  }, [chapterId, statusFilter, currentPage]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchTopics(1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const getStatusBadge = (status) => {
    const variants = {
      'DRAFT': 'secondary',
      'PENDING': 'warning',
      'PUBLISHED': 'success',
      'ACTIVE': 'success',
    };
    const normStatus = status?.toUpperCase()?.trim() || "DRAFT";
    return <Badge bg={variants[normStatus] || 'primary'}>{normStatus}</Badge>;
  };

  return (
    <div className="p-3 border rounded shadow-sm bg-white mt-2">
      <h3 className="mb-3 fw-bold text-secondary">Topics Workspace Hub</h3>

      {alertMessage.text && (
        <Alert variant={alertMessage.type} onClose={() => setAlertMessage({ type: "", text: "" })} dismissible>
          {alertMessage.text}
        </Alert>
      )}


     <div className="p-3 mb-4" style={{ 
    backgroundColor: '#f8fafc',
    borderRadius: '12px', 
    boxShadow: '0 8px 20px rgba(0,0,0,0.04)', 
    border: '1px solid #e2e8f0',
    maxWidth: '850px', 
    margin: '20px auto' 
}}>
    <Form onSubmit={handleSearchSubmit}>
        <div style={{ 
            display: 'flex', 
            flexDirection: 'row', 
            justifyContent: 'flex-start', 
            alignItems: 'center', 
            gap: '16px', 
            flexWrap: 'wrap' 
        }}>
            
            <div style={{ flex: '1', minWidth: '280px' }}> 
                <Form.Control
                    type="text"
                    placeholder="Search by topic title..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ height: '42px', borderRadius: '8px', fontSize: '14px' }}
                />
            </div>
            
            <div style={{ width: '200px', minWidth: '160px' }}> 
                <Form.Select 
                    value={statusFilter} 
                    onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setCurrentPage(1);
                    }}
                    style={{ height: '42px', borderRadius: '8px', fontSize: '14px' }}
                >
                    <option value="">All Statuses</option>
                    <option value="DRAFT">Draft</option>
                    <option value="PENDING">Pending</option>
                    <option value="PUBLISHED">Published</option>
                </Form.Select>
            </div>
            
            <div>
                <Button 
                    variant="primary" 
                    type="submit" 
                    disabled={loading}
                    style={{ 
                        height: '42px', 
                        padding: '0 24px', 
                        fontWeight: '600', 
                        whiteSpace: 'nowrap',
                        borderRadius: '8px' 
                    }}
                >
                    🔍 Search
                </Button>
            </div>
        </div>
    </Form>
</div>

      {loading ? (
        <div className="text-center py-4">
          <Spinner animation="border" size="sm" variant="primary" role="status" />
          <p className="text-muted medium mt-1 mb-0">Syncing sub-topics matrix...</p>
        </div>
      ) : topics && topics.length > 0 ? (
        <>
          <Table striped bordered hover responsive className="align-middle small shadow-sm mb-0">
            <thead className="table-dark">
              <tr>
                <th style={{ width: "70px" }}>Order</th>
                <th>Topic Module Name</th>
                <th style={{ width: "90px" }}>Status</th>
                {isManager && <th style={{ width: "110px" }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {topics.map((topicItem) => (
                <tr key={topicItem.id}>
                  <td><Badge bg="secondary" pill>{topicItem.order || 0}</Badge></td>
                  <td className="fw-semibold text-secondary">{topicItem.title}</td>
                  <td>{getStatusBadge(topicItem.status)}</td>
                  {isManager && (
                    <td>
                      <Button variant="outline-danger" size="disabled" style={{ fontSize: '11px', padding: '1px 6px' }}>
                        Remove
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </Table>

          {meta.totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
              <span className="text-muted extreme-small" style={{ fontSize: '11px' }}>
                Page <strong>{currentPage}</strong> of {meta.totalPages} ({meta.totalRecords} total items)
              </span>
              <Pagination size="sm" className="mb-0">
                <Pagination.Prev disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)} />
                {[...Array(meta.totalPages)].map((_, idx) => (
                  <Pagination.Item
                    key={idx + 1}
                    active={idx + 1 === currentPage}
                    onClick={() => handlePageChange(idx + 1)}
                  >
                    {idx + 1}
                  </Pagination.Item>
                ))}
                <Pagination.Next disabled={currentPage === meta.totalPages} onClick={() => handlePageChange(currentPage + 1)} />
              </Pagination>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-4 border border-dashed rounded bg-light text-muted small">
          No sub-topics are currently mapped or approved inside this chapter block definition criteria.
        </div>
      )}
    </div>
  );
}
