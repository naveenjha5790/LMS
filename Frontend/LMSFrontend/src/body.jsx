import React, { useEffect } from "react";
import { Link, Navigate, Route, Routes, useNavigate, useLocation } from "react-router-dom";
import Login from "./auth/login";
import Signup from "./auth/signup";
import ListPaths from "./learningPath.jsx/listpaths";
import CreatePath from "./learningPath.jsx/craetepath";
import { Button, Container, Navbar, Nav, Alert } from "react-bootstrap";
import ShowChapters from "./chapters/listChapters";
import ShowSubjects from "./subjects/listSubjects";
import CreateSubject from "./subjects/createSubjects";
import CreateChapter from "./chapters/createChapters";
import ModeratorDashboard from "./learningPath.jsx/moderatorDashboard";
import ListAssignments from "./assessment/listAssignment";
import StudentDashboard from "./assessment/studentDashboard";
import ManageUsersPage from "./admin/manageUser";
export default function Body() {
    const [users, setUsers] = React.useState(null);
    const [initializing, setInitializing] = React.useState(true); 

   
    const [learningPath, setLearningPath] = React.useState([]);
    const [subject, setSubject] = React.useState([]);
    const [chapter, setChapter] = React.useState([]);
    
    const [activePath, setActivePath] = React.useState(null);
    const [activeSubject, setActiveSubject] = React.useState(null);

    const [topic, setTopic] = React.useState([]);
    const [mediaFile, setMediaFile] = React.useState([]);
    const [assessment, setAssessment] = React.useState([]);
    const [question, setQuestion] = React.useState([]);
    
    const navigate = useNavigate();
    const location = useLocation();

   
    useEffect(() => {
    localStorage.removeItem("token");
    
    setUsers(null);
    setActivePath(null);
    setActiveSubject(null);
    setInitializing(false);
}, []);

    const handleLogout = () => {
        setUsers(null);
        setActivePath(null);
        setActiveSubject(null);
        localStorage.removeItem("token");
        navigate("/login");
    };

    if (initializing) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <p className="text-muted">Initializing dashboard connection layer...</p>
            </div>
        );
    }

    const normalizedRole = users?.role?.toUpperCase()?.trim() || "";
    const isLMSManager   = normalizedRole === 'LMS_MANAGER' || normalizedRole === 'MANAGER';
    const isModerator=normalizedRole==='MODERATOR';
    const isStudent=normalizedRole==='STUDENT';

        return (
        <Container className="py-4">
          
            <Navbar expand="lg" className="mb-4" style={{ 
    backgroundColor: '#0d6efd',
    padding: '16px', 
    borderRadius: '8px', 
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
}}>
    <Navbar.Brand style={{ fontWeight: 'bold', color: '#ffffff', margin: '0 16px' }}>
        LMS Dashboard
    </Navbar.Brand>
    
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {users ? (
            <>
      
                <span style={{ color: '#f8f9fa', fontSize: '1.1rem', margin: '0 16px' }}>
                    Signed in as: <strong style={{ color: '#ffffff' }}>{users.email || users.username}</strong> ({normalizedRole})
                </span>
                <Button 
                    variant="outline-danger" 
                    size="sm" 
                    onClick={handleLogout}
                    style={{ backgroundColor: '#ffffff', color: '#dc3545', border: '1px solid #dc3545', fontWeight: 'bold' }}
                >
                    Logout
                </Button>
            </>
        ) : (
            location.pathname !== "/login" && location.pathname !== "/signup" && (
                <Button 
                    variant="light" 
                    size="sm" 
                    onClick={() => navigate("/login")}
                    style={{ fontWeight: 'bold', color: '#0d6efd' }}
                >
                    Go to Sign In
                </Button>
            )
        )}
    </div>
</Navbar>

            {!isStudent && (activePath || activeSubject) && (
    <Alert variant="info" className="d-flex gap-3 align-items-center py-2 px-3 mb-4 small shadow-sm">
        {activePath && (
            <div>Active Workspace Path: <strong className="text-dark">{activePath.title}</strong></div>
        )}
        {activeSubject && (
            <div>Active Subject: <strong className="text-dark">{activeSubject.title}</strong></div>
        )}
    </Alert>
)}

         {users && (
    <div className="d-flex flex-wrap gap-2 mb-4 p-3 border rounded shadow-sm bg-white">
        
        {isStudent && (
            <Link to="/studentDashboard">
                <Button variant="success" size="sm" style={{ padding: "20px", margin: "20px", fontWeight: "bold" }}>
                    🎓 Student Dashboard
                </Button>
            </Link>
        )}


        

        {isLMSManager && (
            <Link to="/createPath">
                <Button variant="warning" size="sm" style={{ padding: "20px", margin: "20px" }}>
                    Create Path
                </Button>
            </Link>
        )}


        {(isLMSManager || isStudent) && (
            <Link to="/assignments">
                <Button variant="info" size="sm" style={{ padding: "20px", margin: "20px", fontWeight: "bold", color: "black" }}>
                    📝 View Assignments
                </Button>
            </Link>
        )}

  
        {isModerator && (
            <Link to="/moderatorDashboard">
                <Button variant="danger" size="sm" style={{ padding: "20px", margin: "20px", fontWeight: "bold" }}>
                    🛡️ Moderator Dashboard Workspace
                </Button>
            </Link>
        )}
        {normalizedRole === 'ADMIN' && (
            <Link to="/manageUsers">
                <Button variant="dark" size="sm" style={{ padding: "20px", margin: "20px", fontWeight: "bold" }}>
                    👤 Manage Users & Roles
                </Button>
            </Link>
        )}

        {!isModerator && !isStudent &&(
            <Link to="/getPaths">
                <Button variant="outline-primary" size="sm" style={{ padding: "20px", margin: "20px" }}>
                    View Paths
                </Button>
            </Link>
        )}
    </div>
)}


            
            <Routes>
              
                <Route path="/login" element={<Login setUsers={setUsers} />} />
                <Route path="/signup" element={<Signup setUsers={setUsers} />} />

            
                <Route path="/getPaths" element={
                    users ? (
                        <ListPaths 
                            curUser={users} 
                            setPaths={setLearningPath} 
                            paths={learningPath} 
                            onPathSelect={(pathItem) => setActivePath(pathItem)} 
                        />
                    ) : <Navigate to="/login" replace />
                } />
                <Route path="/createPath" element={
                    users ? (
                        <CreatePath 
                            curUser={users} 
                            setLearningPath={setLearningPath} 
                            learningPath={learningPath} 
                        />
                    ) : <Navigate to="/login" replace />
                } />

                <Route path="/showSubjects" element={
                    users ? (
                        activePath ? (
                            <ShowSubjects 
                                learningPath={activePath} 
                                setSubject={setSubject} 
                                curUser={users} 
                                Subject={subject} 
                                onSubjectSelect={(subItem) => setActiveSubject(subItem)} 
                            />
                        ) : <Navigate to="/getPaths" replace />
                    ) : <Navigate to="/login" replace />
                } />
                <Route path="/createSubject" element={
                    users ? (
                        activePath ? (
                            <CreateSubject 
                                subject={subject} 
                                setSubject={setSubject} 
                                curUser={users} 
                                learningPath={activePath} 
                            />
                        ) : <Navigate to="/getPaths" replace />
                    ) : <Navigate to="/login" replace />
                } />

                <Route path="/showChapters" element={
                    users ? (
                        activeSubject ? (
                            <ShowChapters 
                                subject={activeSubject} 
                                setChapter={setChapter} 
                                curUser={users} 
                                chapter={chapter} 
                            />
                        ) : <Navigate to="/getPaths" replace />
                    ) : <Navigate to="/login" replace />
                } />
                <Route path="/createChapter" element={
                    users ? (
                        activeSubject ? (
                            <CreateChapter 
                                subject={activeSubject} 
                                curUser={users} 
                                chapter={chapter} 
                                setChapter={setChapter} 
                            />
                        ) : <Navigate to="/getPaths" replace />
                    ) : <Navigate to="/login" replace />
                } />
                <Route path="/assignments" element={
                users ? <ListAssignments curUser={users} 
                isStudent={isStudent}/> : <Navigate to="/login" replace />
            } />

            <Route path="/studentDashboard" element={
                users && normalizedRole === 'STUDENT' 
                    ? <StudentDashboard curUser={users} /> 
                    : <Navigate to="/login" replace />
            } />
                <Route path="/moderatorDashboard" element={
                users && normalizedRole === 'MODERATOR' 
                ? <ModeratorDashboard /> 
        : <Navigate to="/login" replace />
        } />
        <Route path="/manageUsers" element={
        users && normalizedRole === 'ADMIN' 
            ? <ManageUsersPage /> 
            : <Navigate to="/login" replace />
    } />

                <Route 
                path="*" 
                element={
                    users ? (
                        normalizedRole === 'MODERATOR' ? (
                            <Navigate to="/moderatorDashboard" replace />
                        ) : normalizedRole === 'STUDENT' ? (
                            <Navigate to="/studentDashboard" replace />
                        ) : (
                            <Navigate to="/getPaths" replace />
                        )
                    ) : (
                        <Navigate to="/login" replace />
                    )
                } 
            />
        
            </Routes>
        </Container>
    );
}
