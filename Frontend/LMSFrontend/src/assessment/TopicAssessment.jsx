import React, { useState, useEffect } from "react";
import { Form, Button, Spinner, Pagination } from "react-bootstrap";
import AssessmentQuestions from "../Questions/AssessmentQuestions";

export default function TopicAssessments({ topicId, isLMSManager }) {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total_pages: 1, total_records: 0 });
  const [titleInput, setTitleInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [selectedAssessmentTitle, setSelectedAssessmentTitle] = useState("");
  const [selectedAssessmentId, setSelectedAssessmentId] = useState(null);

  const loadAssessments = async (targetPage = 1) => {
    if (!topicId) return;
    setLoading(true);
    setErrorMsg("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/${topicId}/assessments?page=${targetPage}&limit=5`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }
      });
      const data = await res.json();
      if (res.ok) {
        setAssessments(data.paths || []);
        setMeta(data.meta || { total_pages: 1, total_records: 0 });
        setPage(data.meta?.current_page || targetPage);
      } else {
        setErrorMsg(data.message || "Failed to sync assessment directories.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Network pipeline connection error caught.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedAssessmentId) {
      loadAssessments(1);
    }
  }, [topicId, selectedAssessmentId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!titleInput.trim()) return;
    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/${topicId}/assessments`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ title: titleInput })
      });
      if (res.ok) {
        setSuccessMsg("Assessment layer generated successfully.");
        setTitleInput("");
        loadAssessments(1);
      } else {
        const errData = await res.json();
        setErrorMsg(errData.message || "Could not save entry model record.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Server pipeline validation timed out.");
    } finally {
      setSubmitting(false);
    }
  };
 if (selectedAssessmentId) {
    return (
      <AssessmentQuestions 
        assessmentId={selectedAssessmentId} 
        isLMSManager={isLMSManager} 
        onBack={() => {
          setSelectedAssessmentId(null);
          setSelectedAssessmentTitle("");
        }} 
      />
    );
  }

  return (
    <div style={{ width: '100%', padding: '10px 0' }}>
      {successMsg && <div className="alert alert-success py-2 px-3 border mb-3 shadow-2xs">{successMsg}</div>}
      {errorMsg && <div className="alert alert-danger py-2 px-3 border mb-3 shadow-2xs">{errorMsg}</div>}

      {isLMSManager && (
        <Form 
          onSubmit={handleSubmit} 
          style={{
            backgroundColor: '#ffffff',
            padding: '24px',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            boxShadow: '0 4px 14px rgba(0,0,0,0.02)',
            marginBottom: '28px'
          }}
        >
          <div style={{ fontWeight: '700', color: '#475569', marginBottom: '14px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Configure New Topic Assessment Module:
          </div>
          <div className="d-flex gap-3">
            <Form.Control 
              type="text" 
              placeholder="e.g., Formative Chapter Evaluation Questionnaire" 
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              required 
              style={{ height: '44px', borderRadius: '8px', fontSize: '14px' }}
            />
            <Button type="submit" variant="success" style={{ height: '44px', padding: '0 24px', fontWeight: '600', borderRadius: '8px' }} disabled={submitting}>
              {submitting ? "Saving..." : "Save Module"}
            </Button>
          </div>
        </Form>
      )}

      <div 
        style={{
          backgroundColor: '#ffffff',
          padding: '24px',
          border: '1px solid #e2e8f0',
          borderRadius: '14px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.04)'
        }}
      >
        <div style={{ fontWeight: '700', color: '#64748b', marginBottom: '18px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Structured Course Evaluators Catalog:
        </div>

        {loading ? (
          <div className="text-center py-4"><Spinner animation="border" size="sm" variant="primary" /></div>
        ) : assessments.length > 0 ? (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {assessments.map((ass) => (
                <div 
                  key={ass.id} 
                  style={{ 
                    backgroundColor: '#f8fafc',
                    padding: '16px 20px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.01)'
                  }}
                >
                  <span style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b' }}>
                    📋 {ass.title}
                  </span>
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                    <span className="text-muted font-mono" style={{ fontSize: '11px', backgroundColor: '#ffffff', padding: '4px 10px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                      ID: {ass.id.slice(0, 8)}...
                    </span>
                    <Button 
                      variant="primary" 
                      size="sm" 
                      style={{ padding: "8px 16px", fontSize: "12px", fontWeight: '600', borderRadius: '6px' }} 
                      onClick={() => {
                        setSelectedAssessmentId(ass.id);
                        setSelectedAssessmentTitle(ass.title);
                      }}
                    >
                      + Add Questions
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {meta.total_pages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                <Pagination size="sm" className="mb-0">
                  {[...Array(meta.total_pages)].map((_, idx) => (
                    <Pagination.Item key={idx + 1} active={idx + 1 === page} onClick={() => loadAssessments(idx + 1)}>
                      {idx + 1}
                    </Pagination.Item>
                  ))}
                </Pagination>
              </div>
            )}
          </>
        ) : (
          <div className="text-center text-muted py-4 fst-italic text-sm" style={{ backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px dashed #cbd5e1' }}>
            No dynamic assessments configured under this training block index yet.
          </div>
        )}
      </div>
    </div>
  );
}
