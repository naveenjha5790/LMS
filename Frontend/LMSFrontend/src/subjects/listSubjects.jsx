import React, { useEffect, useState } from "react";
import { Button, Card, Spinner, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import ShowChapters from "../chapters/listChapters"; 

export default function ShowSubjects({ learningPath, setSubject, curUser, Subject, onSubjectSelect }) {
  const [loading, setLoading] = useState(false);
  const [chaptersBySubject, setChaptersBySubject] = useState({});
  const navigate = useNavigate();

  const isLMSManager = curUser?.role?.toUpperCase() === "LMS_MANAGER" || curUser?.role?.toUpperCase() === "MANAGER";
  const safeSubjectsList = Array.isArray(Subject) 
    ? Subject 
    : (Subject && typeof Subject === 'object' && Array.isArray(Subject.paths)) 
      ? Subject.paths 
      : [];

  useEffect(() => {
    const fetchSubjectsAndChapters = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        
        const res = await fetch(`http://localhost:5000/api/${learningPath.id}/subject?page=1&limit=20`, {
          method: "GET",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` 
          }
        });
        
        if (!res.ok) throw new Error("Failed to fetch subject catalog items");
        const subjectsData = await res.json();
        
      
        const itemsArray = subjectsData.paths || [];
        setSubject(itemsArray);

    
        for (const sub of itemsArray) {
          if (!sub || !sub.id) continue;
          try {
          
            const chapRes = await fetch(`http://localhost:5000/api/${sub.id}/chapters`, {
              headers: { "Authorization": `Bearer ${token}` }
            });
            if (chapRes.ok) {
              const chaps = await chapRes.json();
              const chaptersArray = Array.isArray(chaps) ? chaps : (chaps.paths || chaps.data || []);
              setChaptersBySubject(prev => ({ ...prev, [sub.id]: chaptersArray }));
            }
          } catch (chapErr) {
            console.error(`Failed parsing chapters for subject ${sub.id}:`, chapErr);
          }
        }
      } catch (err) {
        console.error("Endpoint data exception caught:", err);
      } finally {
        setLoading(false);
      }
    };

    if (learningPath?.id) {
      fetchSubjectsAndChapters();
    }
  }, [learningPath, setSubject]);

  if (loading) {
    return (
      <div className="text-center mt-5 py-4">
        <Spinner animation="border" variant="primary" size="sm" className="me-2" />
        <span className="text-muted small">Loading engineering workspace matrix...</span>
      </div>
    );
  }

  return (
    <div className="mt-3" style={{ maxWidth: '950px', margin: '40px auto', padding: '0 20px' }}>
  
  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
    backgroundColor: '#ffffff',
    padding: '20px 24px',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)'
  }}>
    <h4 style={{ fontWeight: '700', margin: 0, color: '#1e293b' }}>
      Workspace: {learningPath.title}
    </h4>
    <Button 
      variant="outline-dark" 
      size="sm" 
      onClick={() => navigate("/getPaths")}
      style={{ fontWeight: '500' }}
    >
      Back to Paths
    </Button>
  </div>

  {safeSubjectsList.length === 0 ? (
    <div className="text-center p-4 border rounded bg-white text-muted small fst-italic mt-3">
      No structured subjects mapped to this specific learning path yet.
    </div>
  ) : (
    safeSubjectsList.map((sub) => (
      
      <Card
        key={sub.id} 
        className="mb-5 bg-white"
        style={{
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)', 
          transform: 'translateY(-2px)', 
          transition: 'all 0.3s ease'
        }}
      >
        <Card.Body style={{ padding: '32px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start', 
            marginBottom: '24px',
            borderBottom: '1px solid #f1f5f9',
            paddingBottom: '20px'
          }}>
            <div>
                <div style={{ marginTop: '8px' }}>
                <Badge bg="secondary" className="small" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
                  Order Position: {sub.order}
                </Badge>
              </div>
              <h2 style={{ fontWeight: '700', color: '#0d6efd', margin: 0, fontSize: '1.75rem' }}>
                {sub.title}
              </h2>
              
              
            </div>

        
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <ShowChapters 
                chaptersList={chaptersBySubject[sub.id] || []} 
                curUser={curUser} 
                subjectId={sub.id}
              />
              {isLMSManager && (
                <Button 
                  variant="success" 
                  size="sm" 
                  style={{ 
                    fontSize: "14px", 
                    padding: '15px 16px', 
                    fontWeight: '600',
                    borderRadius: '8px',
                    color:"blue"
                  }}
                  onClick={() => {
                    if (onSubjectSelect) onSubjectSelect(sub);
                    navigate("/createChapter");
                  }}
                >
                  + Add Chapter
                </Button>
              )}
            </div>
          </div>

          <div className="mt-3">
            <p className="text-secondary fw-bold small uppercase tracking-wider mb-2" style={{ fontSize: "12px", color: '#64748b' }}>
              Structured Lessons inside Subject:
            </p>
          </div>
        </Card.Body>
      </Card>
    ))
  )}
</div>

  );
}
