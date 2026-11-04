import React from "react";
import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';
import Pagination from 'react-bootstrap/Pagination';
import Badge from 'react-bootstrap/Badge';
import { useNavigate } from "react-router-dom";
import SubmitStructureButton from "./submitStructure";
import AssignPathModal from "../assignment/assignPath";

export default function ListPaths({ curUser, paths, setPaths, onPathSelect }) {
    const [loading, setLoading] = React.useState(false);
    const [alertMessage, setAlertMessage] = React.useState({ type: "", text: "" });
    const [search, setSearch] = React.useState("");
    const [statusFilter, setStatusFilter] = React.useState("");
    const isManager = curUser?.role?.toUpperCase() === "LMS_MANAGER" 
    const [currentPage, setCurrentPage] = React.useState(1);
    const [meta, setMeta] = React.useState({ totalRecords: 0, totalPages: 1 });
    
    const navigate = useNavigate();

    const executeFetch = async (pageNumber, currentStatus, currentSearch) => {
        if (!curUser) return;
        setLoading(true);
        setAlertMessage({ type: "", text: "" });

        try {
            const queryParams = new URLSearchParams({
                page: String(pageNumber),
                limit: "5"
            });

            if (currentStatus) queryParams.append("status", currentStatus);
            if (currentSearch.trim()) queryParams.append("search", currentSearch.trim());
            
            const token = localStorage.getItem("token");

            const response = await fetch(`http://localhost:5000/api/paths?${queryParams.toString()}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || "Failed to fetch learning paths");
            }


            setPaths(data.paths || []);
            setMeta({
                totalRecords: data.meta?.total_records || 0,
                totalPages: data.meta?.total_pages || 1
            });

        } catch (error) {
            setAlertMessage({
                type: "danger",
                text: error.message || "An unexpected error occurred while loading paths."
            });
            setPaths([]);
        } finally {
            setLoading(false);
        }
    };


    React.useEffect(() => {
        if (curUser) {
            executeFetch(currentPage, statusFilter, search);
        }

    }, [curUser, currentPage, statusFilter]); 

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        executeFetch(1, statusFilter, search);
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };
    const handleLocalStateSuccess = (pathId) => {
  if (setPaths) {
    setPaths((prevPaths) =>
      prevPaths.map((p) =>
        p.id === pathId ? { ...p, status: "PENDING_STRUCTURE_APPROVAL", rejectReason: null } : p
      )
    );
  }
};
const refreshPathCatalogData = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`http://localhost:5000/api/getPaths`, { // Use your exact fetch paths endpoint
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });
    const freshData = await response.json();
    

    setPaths(Array.isArray(freshData) ? freshData : freshData.paths || []);
  } catch (err) {
    console.error("Failed to auto-refresh canvas workspace entries:", err);
  }
};

    const getStatusBadge = (status) => {
        const variants = {
            'DRAFT': 'secondary',
            'PENDING_STRUCTURE_APPROVAL': 'warning',
            'PUBLISHED': 'success',
            'REJECTED': 'danger',
            'STRUCTURE_APPROVED': 'primary'
        };
        return <Badge bg={variants[status] || 'primary'}>{status}</Badge>;
    };

        return (
        <div className="p-4 border rounded shadow-sm bg-white">
            <h3 className="mb-4">Learning Paths Layout Workspace</h3>

            {alertMessage.text && (
                <Alert variant={alertMessage.type} onClose={() => setAlertMessage({ type: "", text: "" })} dismissible>
                    {alertMessage.text}
                </Alert>
            )}

         <div className="p-3 mb-4" style={{ 
    backgroundColor: '#e3f2fd', 
    borderRadius: '12px', 
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
    border: '1px solid #bbdefb'
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
            <div style={{ width: '300px' }}>
                <Form.Control
                    type="text"
                    placeholder="Search by title..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ height: '42px' }}
                />
            </div>
            
            <div style={{ width: '220px' }}> 
                <Form.Select 
                    value={statusFilter} 
                    onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setCurrentPage(1); 
                    }}
                    style={{ height: '42px' }}
                >
                    <option value="">All Statuses</option>
                    <option value="DRAFT">Draft</option>
                    <option value="PENDING_STRUCTURE_APPROVAL">Pending Approval</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="STRUCTURE_APPROVED">Structure Approved</option>
                    <option value="REJECTED">Rejected</option>
                </Form.Select>
            </div>
            
            <div>
                <Button 
                    variant="primary" 
                    type="submit" 
                    disabled={loading}
                    style={{ height: '42px', padding: '0 24px', fontWeight: 'bold', whiteSpace: 'nowrap' }}
                >
                    🔍 Search
                </Button>
                <Button 
                    variant="outline-secondary" 
                    type="button"
                    disabled={loading}
                    onClick={() => handlePageChange(currentPage)} 
                    style={{ height: '42px', padding: '0 20px', fontWeight: '600', whiteSpace: 'nowrap', backgroundColor: '#ffffff' }}
                >
                    🔄 Sync Dashboard
                </Button>
            </div>

        </div>
    </Form>
</div>



            {loading ? (
    <div className="text-center py-5">
        <Spinner animation="border" variant="primary" role="status" />
        <p className="text-muted small mt-2">Loading content paths...</p>
    </div>
) : paths && paths.length > 0 ? (
   
    <div style={{
        maxWidth: '1100px',
        margin: '40px auto',
        padding: '32px', 
        backgroundColor: '#f8faff', 
        borderRadius: '16px',
        border: '1px solid #dee2e6',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.04)'
    }}>
        <Table striped bordered hover responsive style={{ marginBottom: '30px', verticalAlign: 'middle' }}>
            <thead className="table-dark">
                <tr>
                    <th style={{ padding: '16px' }}>Title</th>
                    <th style={{ padding: '16px' }}>Status</th>
                    <th style={{ padding:"20px" }}>Approval</th> 
                    <th style={{ width: "260px", padding: '16px' }}>Actions</th>
                </tr>
            </thead>
            <tbody>
                {paths.map((path) => {
                    const userRole = curUser?.role?.toUpperCase()?.trim() || "";
                    const isManager = userRole === "LMS_MANAGER" || userRole === "MANAGER";

                    return (
                        <tr key={path.id}>
                           
                            <td style={{ padding: '18px 16px' }}>
                                <strong>{path.title}</strong>
                            </td>
                            <td style={{ padding: '18px 16px' }}>
                                {getStatusBadge(path.status)}
                            </td>
                            <td style={{ padding: "20px" }}>

                <SubmitStructureButton 
        pathId={path.id}
        status={path.status}
        isManager={isManager}
        onSubmissionSuccess={handleLocalStateSuccess}
        onSetAlert={setAlertMessage}
      />
        </td>

                            <td style={{ padding: '18px 16px' }}>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <Button 
                                        variant="outline-primary" 
                                        size="sm"
                                        style={{ flexGrow: 1, padding: '8px 14px', fontWeight: '500' }}
                                        onClick={() => {
                                            if (onPathSelect) onPathSelect(path);
                                            navigate("/showSubjects");
                                        }}
                                    >
                                        View Subjects
                                    </Button>

                                    {isManager && (
                                        <Button 
                                            variant="success" 
                                            size="sm"
                                            style={{ padding: '8px 14px', fontWeight: '500', whiteSpace: 'nowrap' }}
                                            onClick={() => {
                                                if (onPathSelect) onPathSelect(path);
                                                navigate("/createSubject");
                                            }}
                                        >
                                            + Add Subject
                                        </Button>
                                    )}
                                    {isManager && path.status === "PUBLISHED" && (
            <AssignPathModal 
                pathItem={path} 
                onSuccess={(msg) => setAlertMessage({ type: "success", text: msg })}
            />
        )}
                                </div>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </Table>

        {meta.totalPages > 1 && (
          
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                paddingTop: '16px',
                borderTop: '1px solid #e9ecef'
            }}>
                <span className="text-muted small">
                    Showing page <strong>{currentPage}</strong> of {meta.totalPages} ({meta.totalRecords} total entries)
                </span>
                <Pagination className="mb-0">
                    <Pagination.Prev disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)} />
                    {[...Array(meta.totalPages)].map((_, index) => (
                        <Pagination.Item
                            key={index + 1}
                            active={index + 1 === currentPage}
                            onClick={() => handlePageChange(index + 1)}
                        >
                            {index + 1}
                        </Pagination.Item>
                    ))}
                    <Pagination.Next disabled={currentPage === meta.totalPages} onClick={() => handlePageChange(currentPage + 1)} />
                </Pagination>
            </div>
        )}
    </div>
) : (
    <div className="text-center py-5 border rounded bg-light text-muted small" style={{ maxWidth: '1100px', margin: '40px auto' }}>
        No learning roadmaps found matching criteria.
    </div>
)}


  <Button variant="outline-primary" size="sm" className="p-2 border-0 rounded-circle text-muted hover:text-primary">
    
  </Button>
</div>

    );

}
