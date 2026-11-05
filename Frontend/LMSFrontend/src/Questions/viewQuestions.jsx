import React, { useState } from "react";
import { Modal, Button, Card, Form, Spinner, Alert } from "react-bootstrap";

export default function StudentQuizModal({ show, onHide, assessment, topicId, pathTitle }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [userAnswers, setUserAnswers] = useState({}); // Structures: { [questionId]: selectedOptionIndex }
  const [quizResult, setQuizResult] = useState(null); // Stores server evaluation response payloads

  // Fetch Questions Ledger whenever the Modal opens
  React.useEffect(() => {
    if (show && assessment) {
      fetchQuestions();
    }
  }, [show, assessment]);

  const fetchQuestions = async () => {
    setLoading(true);
    setError("");
    setQuizResult(null);
    setUserAnswers({});
    setQuestions([]);

    try {
      const token = localStorage.getItem("token");
      const assessmentId = assessment.id || assessment._id;
      

      const response = await fetch(`http://localhost:5000/api/${assessmentId}/questions?page=1&limit=100`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Failed to load assessment questionnaire layout.");
      setQuestions(data.paths || []); 
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId, optionIndex) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleQuizSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/${topicId}/quiz`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          userAnswers: userAnswers,
          pathTitle: pathTitle || "Selected Path Workspace"
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "Evaluation transaction error.");
      }

      setQuizResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={() => !submitting && onHide()} size="lg" backdrop="static" centered>
      <Modal.Header closeButton={!submitting}>
        <Modal.Title className="h6 fw-bold">
          Assessment Panel: <span className="text-success">{assessment?.title}</span>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ minHeight: "250px" }}>
        {error && <Alert variant="danger">{error}</Alert>}

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="success" />
            <p className="text-muted small mt-2">Compiling test questions sheet...</p>
          </div>
        ) : quizResult ? (

          <div className="text-center p-4">
            <div className="fs-1 mb-2">{quizResult.success ? "🎉" : "❌"}</div>
            <h4 className={`fw-bold ${quizResult.success ? "text-success" : "text-danger"}`}>
              {quizResult.success ? "Quiz Passed Successfully!" : "Review Required"}
            </h4>
            <h5 className="fw-bold my-3 text-dark">Final Grade: {quizResult.score}%</h5>
            <p className="text-muted small px-3">{quizResult.message}</p>

            {quizResult.certificateUnlocked && (
              <Alert variant="warning" className="mt-4 border-dashed py-3">
                <h6 className="fw-bold text-dark">🎓 Official Credentials Unlocked!</h6>
                <p className="small text-muted mb-2">You have completed all milestones across this syllabus track.</p>
                <div className="text-xs text-secondary monospace text-break bg-white p-2 rounded border" style={{ fontSize: "11px" }}>
                  Verification Token Hash: <strong>{quizResult.certificate?.secureHash}</strong>
                </div>
              </Alert>
            )}

            <Button variant="dark" className="mt-3 px-4 fw-bold" onClick={onHide}>
              Return to Module Registry
            </Button>
          </div>
        ) : (

          <Form onSubmit={handleQuizSubmit}>
            {questions.length === 0 ? (
              <Alert variant="warning" className="small">This assessment doesn't contain any active question items.</Alert>
            ) : (
              <div className="d-flex flex-column gap-4 px-1" style={{ maxHeight: "480px", overflowY: "auto" }}>
                {questions.map((q, qIdx) => (
                  <Card key={q.id} className="border p-3 shadow-xs bg-white">
                    <div className="fw-bold text-dark mb-3 small d-flex gap-2">
                      <span>{qIdx + 1}.</span>
                      <span>{q.text || q.questionText || "Question statement missing"}</span>
                    </div>
                    <div className="d-flex flex-column gap-2 ps-2">
        
                      {(Array.isArray(q.options) ? q.options : [q.optionA, q.optionB, q.optionC, q.optionD].filter(Boolean)).map((opt, oIdx) => (
                        <Form.Check
                          type="radio"
                          id={`q-${q.id}-opt-${oIdx}`}
                          key={oIdx}
                          name={`question-${q.id}`}
                          label={typeof opt === "object" ? opt.text : opt}
                          checked={userAnswers[q.id] === oIdx}
                          onChange={() => handleSelectOption(q.id, oIdx)}
                          className="small text-secondary fw-medium cursor-pointer"
                        />
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            )}

            <Modal.Footer className="px-0 pb-0 pt-3 mt-3 border-top">
              <Button variant="secondary" size="sm" disabled={submitting} onClick={onHide}>
                Abandon Quiz
              </Button>
              <Button 
                variant="success" 
                size="sm" 
                type="submit" 
                disabled={submitting || questions.length === 0 || Object.keys(userAnswers).length < questions.length}
              >
                {submitting ? <Spinner size="sm" animation="border" className="me-1" /> : "🚀 Submit Final Evaluation"}
              </Button>
            </Modal.Footer>
          </Form>
        )}
      </Modal.Body>
    </Modal>
  );
}
