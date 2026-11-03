import React, { useState, useEffect } from "react";
import { Form, Button, Spinner, Pagination, Card, ListGroup, Alert } from "react-bootstrap";

/**
 * 
 * .
 * 
 * @param {String} assessmentId 
 * @param {Boolean} isLMSManager 
 * @param {Function} onBack 
 */
export default function AssessmentQuestions({ assessmentId, isLMSManager, onBack }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total_pages: 1, total_records: 0 });


  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const [status, setStatus] = useState({ type: "", text: "" });

  const loadQuestions = async (targetPage = 1) => {
    if (!assessmentId) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/${assessmentId}/questions?page=${targetPage}&limit=5`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      const data = await res.json();
      if (res.ok) {
        setQuestions(data.paths || []);
        setMeta(data.meta || { total_pages: 1, total_records: 0 });
        setPage(data.meta?.current_page || targetPage);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions(1);
  }, [assessmentId]);

  const handleOptionChange = (idx, value) => {
    const updatedOptions = [...options];
    updatedOptions[idx] = value;
    setOptions(updatedOptions);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!questionText.trim() || options.some(opt => !opt.trim())) {
      setStatus({ type: "danger", text: "Please fill in the question text and all available options." });
      return;
    }

    setSubmitting(true);
    setStatus({ type: "", text: "" });

    const payload = [{
      questionText: questionText.trim(),
      options: options.map(opt => opt.trim()),
      correctIndex: parseInt(correctIndex, 10)
    }];

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/${assessmentId}/questions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setStatus({ type: "success", text: "Question added successfully!" });
        setQuestionText("");
        setOptions(["", "", "", ""]);
        setCorrectIndex(0);
        loadQuestions(1); 
      } else {
        const errData = await res.json();
        setStatus({ type: "danger", text: errData.message || "Failed to submit item configuration." });
      }
    } catch (err) {
      console.error(err);
      setStatus({ type: "danger", text: "Network connection loss detected." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ width: '100%', minWidth: '700px', margin: '20px auto', textAlign: 'left' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Button 
          variant="outline-dark" 
          size="sm" 
          style={{ fontWeight: '600', padding: '8px 18px', borderRadius: '8px' }} 
          onClick={onBack}
        >
          ← Back to Assessment List
        </Button>
        <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>
          Workspace / Questions Manager
        </span>
      </div>

      {status.text && (
        <div style={{ marginBottom: '20px' }}>
          <Alert variant={status.type} onClose={() => setStatus({ type: "", text: "" })} dismissible style={{ borderRadius: '10px' }}>
            {status.text}
          </Alert>
        </div>
      )}


      <div style={{
        backgroundColor: '#ffffff',
        padding: '35px',
        borderRadius: '20px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.07)'
      }}>

        <div style={{ borderBottom: '2px solid #f1f5f9', paddingBottom: '20px', marginBottom: '32px' }}>
          <span style={{ textTransform: 'uppercase', fontSize: '11px', fontWeight: '700', color: '#10b981', letterSpacing: '0.05em' }}>
            Active Question Management Engine
          </span>
          <h1 style={{ fontSize: '1.9rem', fontWeight: '800', color: '#1e293b', marginTop: '6px', marginBottom: '0' }}>
            🛠️ Questions Management Matrix
          </h1>
        </div>

        {isLMSManager && (
          <Form onSubmit={handleFormSubmit} style={{ backgroundColor: '#f8fafc', padding: '28px', borderRadius: '14px', border: '1px solid #e2e8f0', marginBottom: '40px' }}>
            <h4 style={{ fontWeight: '700', fontSize: '1.2rem', color: '#334155', marginBottom: '20px' }}>
              ➕ Create Next Exam Item
            </h4>
            
            <Form.Group className="mb-4">
              <Form.Label style={{ fontWeight: '600', color: '#475569', fontSize: '14px' }}>Question Text Statement</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Enter question text statement..." 
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                required 
                style={{ height: '46px', fontSize: '15px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </Form.Group>

            <div className="row g-3 mb-4">
              {options.map((option, idx) => (
                <div key={idx} className="col-md-6">
                  <Form.Label style={{ fontWeight: '600', color: '#64748b', fontSize: '13px' }}>Option {String.fromCharCode(65 + idx)}</Form.Label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#ffffff', padding: '4px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                    <Form.Check 
                      type="radio" 
                      name={`correctAnswer_${assessmentId}`}
                      checked={correctIndex === idx}
                      onChange={() => setCorrectIndex(idx)}
                      title="Mark this item index option as correct answer"
                      style={{ transform: 'scale(1.15)', cursor: 'pointer' }}
                    />
                    <Form.Control 
                      type="text" 
                      placeholder={`Choice entry point ...`} 
                      value={option}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                      required 
                      style={{ border: 'none', height: '38px', fontSize: '14px', paddingLeft: '4px', boxShadow: 'none' }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', padding: '16px 20px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>💡 Radio checks select correct answer targets.</span>
              <Button type="submit" variant="success" style={{ height: '42px', padding: '0 24px', fontWeight: '600', borderRadius: '8px' }} disabled={submitting}>
                {submitting ? "Saving..." : "Save Question Item"}
              </Button>
            </div>
          </Form>
        )}
        <div>
          <h4 style={{ fontWeight: '700', fontSize: '1.25rem', color: '#1e293b', marginBottom: '20px' }}>
            Active Questions Queue ({meta.total_records || questions.length})
          </h4>
          
          {loading ? (
            <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
          ) : questions.length > 0 ? (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {questions.map((q, qIdx) => (
               
                  <Card key={q.id || qIdx} style={{ backgroundColor: '#ffffff', padding: '24px', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 14px rgba(0,0,0,0.02)' }}>
                    <div style={{ fontSize: '1.15rem', fontWeight: '700', color: '#1e293b', marginBottom: '16px', lineHeight: '1.5' }}>
                      Q{(page - 1) * 5 + qIdx + 1}. {q.questionText}
                    </div>
                    
                    <ListGroup style={{ borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                      {Array.isArray(q.options) && q.options.map((opt, oIdx) => {
                        const isCorrect = oIdx === parseInt(q.correctIndex, 10);
                        return (
                          <ListGroup.Item                            
                           key={oIdx} 
                            style={{ 
                              padding: '12px 20px', 
                              fontSize: '14px',
                       
                              backgroundColor: (isCorrect && isLMSManager) ? '#ecfdf5' : '#ffffff',

                              color: (isCorrect && isLMSManager) ? '#065f46' : '#475569',
                              fontWeight: (isCorrect && isLMSManager) ? '700' : '400',
                              borderBottom: oIdx === q.options.length - 1 ? 'none' : '1px solid #e2e8f0'
                            }}
                          >
                            <span style={{ marginRight: '8px', opacity: (isCorrect && isLMSManager) ? 1 : 0.6 }}>
                              ({String.fromCharCode(65 + oIdx)})
                            </span> 
                            {opt} 
                          
                            {isCorrect && isLMSManager && <span style={{ marginLeft: '8px', color: '#10b981' }}>✓</span>}
                          </ListGroup.Item>
                        );
                      })}
                    </ListGroup>
                  </Card>
                ))}
              </div>

              {meta.total_pages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '30px' }}>
                  <Pagination className="mb-0">
                    <Pagination.Prev disabled={page === 1} onClick={() => loadQuestions(page - 1)} />
                    {[...Array(meta.total_pages)].map((_, idx) => (
                      <Pagination.Item key={idx + 1} active={idx + 1 === page} onClick={() => loadQuestions(idx + 1)}>
                        {idx + 1}
                      </Pagination.Item>
                    ))}
                    <Pagination.Next disabled={page === meta.total_pages} onClick={() => loadQuestions(page + 1)} />
                  </Pagination>
                </div>
              )}
            </>
          ) : (
            <div style={{ backgroundColor: '#f8fafc', padding: '40px', borderRadius: '12px', border: '1px dashed #cbd5e1', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
              No active questions added to this questionnaire template sequence yet.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

