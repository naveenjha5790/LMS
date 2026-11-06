import React, { useState } from 'react';
import { Button, Modal, Form } from 'react-bootstrap';

export default function QuestionActions({ question, onUpdate, onDelete }) {
  // Modal states
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [loading, setLoading] = useState(false);


  const [questionText, setQuestionText] = useState(question.questionText || '');
  const [correctIndex, setCorrectIndex] = useState(question.correctIndex || 0);

  // Handle Update Request
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/questions/${question.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ questionText, correctIndex: Number(correctIndex) })
      });

      if (response.ok) {
        const updatedQuestion = await response.json();
        onUpdate(updatedQuestion); // Notify parent component to refresh state
        setShowEdit(false);
      } else {
        alert("Failed to update question");
      }
    } catch (error) {
      console.error("Error updating question:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/questions/${question.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        onDelete(question.id); 
        setShowDelete(false);
      } else {
        alert("Failed to delete question");
      }
    } catch (error) {
      console.error("Error deleting question:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>

      <div className="d-flex gap-2">
        <Button variant="outline-primary" size="sm" onClick={() => setShowEdit(true)}>
          Edit
        </Button>
        <Button variant="outline-danger" size="sm" onClick={() => setShowDelete(true)}>
          Delete
        </Button>
      </div>


      <Modal show={showEdit} onHide={() => setShowEdit(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Question</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleUpdateSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3" controlId="formQuestionText">
              <Form.Label>Question Text</Form.Label>
              <Form.Control 
                type="text" 
                value={questionText} 
                onChange={(e) => setQuestionText(e.target.value)} 
                required 
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formCorrectIndex">
              <Form.Label>Correct Index Option</Form.Label>
              <Form.Control 
                type="number" 
                value={correctIndex} 
                onChange={(e) => setCorrectIndex(e.target.value)} 
                required 
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEdit(false)}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

    
      <Modal show={showDelete} onHide={() => setShowDelete(false)} centered size="sm">
        <Modal.Header closeButton>
          <Modal.Title className="text-danger fs-5">Delete Question?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to permanently delete this question?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" size="sm" onClick={() => setShowDelete(false)}>Cancel</Button>
          <Button variant="danger" size="sm" onClick={handleDeleteSubmit} disabled={loading}>
            {loading ? 'Deleting...' : 'Confirm Delete'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
