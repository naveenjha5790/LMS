import React, { useState, useEffect } from "react";
import { Table, Form, Button, Row, Col, Alert, Spinner, Pagination, Container, Badge,Card,ListGroup } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import TopicContentViewer from "../topic/TopicContent";

export default function ListAssignments({ curUser,isStudent }) {
  const [loading, setLoading] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [alertMessage, setAlertMessage] = useState({ type: "", text: "" });
  const [selectedPath, setSelectedPath] = useState(null);
    const [subjects, setSubjects] = useState([]);
    const [loadingSubjects, setLoadingSubjects] = useState(false);
    const [error, setError] = useState("");
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [chapters, setChapters] = useState([]);
    const [loadingChapters, setLoadingChapters] = useState(false);

    const [selectedChapter, setSelectedChapter] = useState(null);
    const [topics, setTopics] = useState([]);
    const [loadingTopics, setLoadingTopics] = useState(false);
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

      const rawPaths = data.paths || [];

      const detailsResponse = await fetch(`http://localhost:5000/api/paths`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const detailsData = await detailsResponse.json();
      
      const globalPathsList = Array.isArray(detailsData) ? detailsData : (detailsData.paths || []);
      const hydratedPaths = rawPaths.map(item => {
        let targetId = "";
        if (typeof item === "string") {
          targetId = item;
        } else if (item) {

          targetId = item.pathid || item.pathId || item.learningPathId || item.id || item._id;
        }

        const match = globalPathsList.find(p => p.id === targetId || p._id === targetId);
        
        if (match) {
          return {
            ...item, 
            id: targetId, 
            title: match.title,
            description: match.description
          };
        }

        return item;
      });

      setAssignments(hydratedPaths);

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
  const handleViewSubjects = async (path) => {
    console.log("Selected path object received:", path);
    const normalizedPath = typeof path === "string" ? { id: path, title: "Selected Path Workspace" } : path;

        setSelectedPath(path);
        setSelectedSubject(null); 
        setSelectedChapter(null);
        setSubjects([]);
        setLoadingSubjects(true);

        try {
            const token = localStorage.getItem("token");
            const pathId = typeof path === "string" ? path : (path.id || path._id || path.learningPathId?.id || path.learningPathId?._id);
            
            const response = await fetch(`http://localhost:5000/api/${pathId}/subject`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await response.json();
            setSubjects(Array.isArray(data) ? data : data.paths || []);
        } catch (err) {
            console.error("Error retrieving path subjects:", err);
        } finally {
            setLoadingSubjects(false);
        }
    };
   const handleViewChapters = async (subject) => {
    console.log("Selected subject received:", subject);
    
    // Safely extract string or object ID reference
    const subjectId = typeof subject === "string" ? subject : (subject.id || subject._id);
    const normalizedSubject = typeof subject === "string" ? { id: subject, title: "Selected Subject" } : subject;

    setSelectedSubject(normalizedSubject);
    setSelectedChapter(null); 
    setChapters([]);
    setLoadingChapters(true);

    try {
        const token = localStorage.getItem("token");
        
        const response = await fetch(`http://localhost:5000/api/${subjectId}/chapters`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await response.json();
        
        console.log("Chapters response data payload:", data);

        if (data && Array.isArray(data.chapters)) {
            setChapters(data.chapters);
        } else if (data && Array.isArray(data.paths)) {
            setChapters(data.paths); 
        } else if (Array.isArray(data)) {
            setChapters(data);
        } else {
            setChapters([]);
        }
    } catch (err) {
        console.error("Error retrieving chapters:", err);
    } finally {
        setLoadingChapters(false);
    }
  };

  const handleViewTopics = async (chapter) => {
    console.log("Selected chapter received:", chapter);

    const chapterId = typeof chapter === "string" ? chapter : (chapter.id || chapter._id);
    const normalizedChapter = typeof chapter === "string" ? { id: chapter, title: "Selected Chapter" } : chapter;

    setSelectedChapter(normalizedChapter);
    setTopics([]);
    setLoadingTopics(true);

    try {
        const token = localStorage.getItem("token");
        
        const response = await fetch(`http://localhost:5000/api/${chapterId}/topics`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await response.json();
        
        console.log("Topics response data payload:", data);

        if (data && Array.isArray(data.topics)) {
            setTopics(data.topics);
        } else if (data && Array.isArray(data.paths)) {
            setTopics(data.paths);
        } else if (Array.isArray(data)) {
            setTopics(data);
        } else {
            setTopics([]);
        }
    } catch (err) {
        console.error("Error retrieving learning topics:", err);
    } finally {
        setLoadingTopics(false);
    }
  };

    if (loading) {
        return (
            <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="text-muted mt-2">Loading your active assigned courses...</p>
            </div>
        );
    }
      return (
        <Container fluid className="py-4">
            {error && <Alert variant="danger" dismissible onClose={() => setError("")}>{error}</Alert>}

            <Row>
   
                <Col md={4} className="mb-4">
                    <h4 className="fw-bold mb-3 text-secondary">My Assigned Paths</h4>
                    {assignments.length === 0 ? (
                        <Alert variant="warning">No learning paths have been assigned to your profile yet.</Alert>
                    ) : (
                        <div className="d-flex flex-column gap-3">
                            {assignments.map((item) => {
    const isCurrentActive = selectedPath?.id === item.pathid || selectedPath?.id === item.id;

    return (
        <Card 
            key={item.id} 
            className={`shadow-sm border-start border-4 ${isCurrentActive ? "border-primary bg-light" : "border-success"}`}
        >
            <Card.Body>
                <Card.Title className="fw-bold text-dark">{item.title || "Untitled Course"}</Card.Title>
                <Card.Text className="text-muted small">
                    {item.description || "No description provided for this path structure."}
                </Card.Text>
                <div className="d-flex justify-content-between align-items-center mt-3">
                    <Badge bg="success">Assigned</Badge>
                    <Button 
                        variant={isCurrentActive ? "primary" : "outline-primary"} 
                        size="sm"
                        onClick={() => handleViewSubjects(item)} 
                    >
                        View Subjects →
                    </Button>
                </div>
            </Card.Body>
        </Card>
    );
})}

                        </div>
                    )}
                </Col>

                <Col md={8}>
                    {!selectedPath ? (
                        <div className="text-center py-5 bg-white border rounded shadow-sm">
                            <h5 className="text-muted mb-0">Select an assigned learning path from the column list to start studying.</h5>
                        </div>
                    ) : (
                        <Card className="shadow-sm border-0">
                            <Card.Header className="bg-dark text-white p-3">
                                <h5 className="mb-0 fw-bold">📖 Workspace Content: {selectedPath.title}</h5>
                            </Card.Header>
                            <Card.Body className="bg-light">
                                <Row>
                          
                                    <Col sm={4} className="border-end mb-3 mb-sm-0">
                                        <h6 className="fw-bold text-primary mb-2">📚 Subjects</h6>
                                        {loadingSubjects && (
                                            <div className="text-center py-2">
                                                <Spinner animation="border" size="sm" variant="primary" />
                                            </div>
                                        )}
                                        {!loadingSubjects && subjects.length === 0 && (
                                            <p className="text-muted small italic">No subjects mapped here.</p>
                                        )}
                                        <ListGroup size="sm">
                                            {subjects.map((sub) => (
                                                <ListGroup.Item 
                                                    key={sub._id || sub.id}
                                                    action
                                                    active={selectedSubject?._id === sub._id || selectedSubject?.id === sub.id}
                                                    onClick={() => handleViewChapters(sub)}
                                                    className="small fw-semibold text-truncate"
                                                >
                                                    {sub.title}
                                                </ListGroup.Item>
                                            ))}
                                        </ListGroup>
                                    </Col>

                                    <Col sm={4} className="border-end mb-3 mb-sm-0">
                                        <h6 className="fw-bold text-success mb-2">📑 Chapters</h6>
                                        {!selectedSubject ? (
                                            <p className="text-muted small italic">Select a subject to view chapters...</p>
                                        ) : loadingChapters ? (
                                            <div className="text-center py-2">
                                                <Spinner animation="border" size="sm" variant="success" />
                                            </div>
                                        ) : chapters.length === 0 ? (
                                            <p className="text-muted small italic">No chapters published.</p>
                                        ) : (
                                            <ListGroup size="sm">
                                                {chapters.map((ch) => (
                                                    <ListGroup.Item 
                                                        key={ch._id || ch.id}
                                                        action
                                                        active={selectedChapter?._id === ch._id || selectedChapter?.id === ch.id}
                                                        onClick={() => handleViewTopics(ch)}
                                                        className="small text-truncate"
                                                    >
                                                        {ch.title}
                                                    </ListGroup.Item>
                                                ))}
                                            </ListGroup>
                                        )}
                                    </Col>

                                    <Col sm={4}>
                                        <h6 className="fw-bold text-danger mb-2">💡 Course Topics</h6>
                                        {!selectedChapter ? (
                                            <p className="text-muted small italic">Select a chapter to access topics...</p>
                                        ) : loadingTopics ? (
                                            <div className="text-center py-2">
                                                <Spinner animation="border" size="sm" variant="danger" />
                                            </div>
                                        ) : topics.length === 0 ? (
                                            <p className="text-muted small italic">No topics uploaded yet.</p>
                                        ) : (
                                            <div className="d-flex flex-column gap-2" style={{ maxHeight: "400px", overflowY: "auto" }}>
                                                {topics.map((topicItem) => (
                                                    <Card key={topicItem._id || topicItem.id} className="bg-white border p-2 shadow-sm">
                                                        <div className="fw-bold text-dark" style={{ fontSize: "13px" }}>
                                                            {topicItem.title}
                                                        </div>
                                                                                                                {topicItem.description && (
                                                            <div className="text-muted my-1" style={{ fontSize: "11px", display: "-webkit-box", WebkitLineClamp: "2", WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                                                {topicItem.description}
                                                            </div>
                                                        )}
                                                        <TopicContentViewer topicItem={topicItem} 
                                                        pathTitle={selectedPath?.title}
                                                        />
                                                        {topicItem.contentUrl && (
                                                            <Button 
                                                                href={topicItem.contentUrl} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer"
                                                                variant="outline-danger" 
                                                                size="sm" 
                                                                className="mt-1 py-1 px-2 fw-semibold w-100"
                                                                style={{ fontSize: "11px" }}
                                                            >
                                                                📂 Access Material
                                                            </Button>
                                                        )}
                                                    </Card>
                                                ))}
                                            </div>
                                        )}
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    )}
                </Col>
            </Row>
        </Container>
    );
}
