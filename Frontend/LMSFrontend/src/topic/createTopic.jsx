import React, { useState } from "react";
import { Form, Button, Alert, Card, Spinner } from "react-bootstrap";

export default function CreateTopic({ chapterId, setTopics }) {
  const [newTopic, setNewTopic] = useState({
    title: "",
    order: 0,
  });
  const [submitting, setSubmitting] = useState(false);
  const [alertMessage, setAlertMessage] = useState({ type: "", text: "" });

  function handleChange(e) {
    const { name, value } = e.target;
    setNewTopic((prev) => ({
      ...prev,
      [name]: name === "order" ? parseInt(value, 10) || 0 : value, 
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setAlertMessage({ type: "", text: "" });

    if (!chapterId) {
      setAlertMessage({ type: "danger", text: "Chapter validation context missing." });
      return;
    }

   
    if (!newTopic.title.trim() || newTopic.order <= 0) {
      setAlertMessage({
        type: "danger",
        text: "Title and the order of topics are mandatory.",
      });
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      
 
      const response = await fetch(`http://localhost:5000/api/chapters/${chapterId}/topics`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newTopic.title.trim(),
          order: newTopic.order,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Failed to create topic! Please try again.");
      }

      setAlertMessage({
        type: "success",
        text: "Topic appended successfully to the workspace structure!",
      });

      setNewTopic({ title: "", order: 0 });

      if (setTopics) {
        setTopics((prevTopics) => {
          const standardArray = Array.isArray(prevTopics) ? prevTopics : [];
          return [...standardArray, data].sort((a, b) => a.order - b.order);
        });
      }

    } catch (error) {
      setAlertMessage({
        type: "danger",
        text: error.message || "An unexpected network communication error occurred.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="shadow-sm border-0 bg-light mt-2">
      <Card.Body className="p-3">
        <h6 className="text-success fw-bold small mb-3">Add New Topic Segment</h6>

        {alertMessage.text && (
          <Alert 
            variant={alertMessage.type} 
            onClose={() => setAlertMessage({ type: "", text: "" })} 
            className="py-2 px-3 small mb-3"
            dismissible
          >
            {alertMessage.text}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <div className="row g-2 align-items-end">
            <div className="col-md-7">
              <Form.Group controlId="topicTitle">
                <Form.Label className="text-muted mb-1" style={{ fontSize: "11px" }}>Topic Title</Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  size="sm"
                  placeholder="e.g., Working with JSON Web Tokens"
                  value={newTopic.title}
                  onChange={handleChange}
                  disabled={submitting}
                  required
                />
              </Form.Group>
            </div>

            <div className="col-md-2">
              <Form.Group controlId="topicOrder">
                <Form.Label className="text-muted mb-1" style={{ fontSize: "11px" }}>Sequence Order</Form.Label>
                <Form.Control
                  type="number"
                  name="order"
                  size="sm"
                  placeholder="0"
                  value={newTopic.order || ""}
                  onChange={handleChange}
                  disabled={submitting}
                  required
                />
              </Form.Group>
            </div>

            <div className="col-md-3">
              <Button 
                variant="success" 
                type="submit" 
                size="sm" 
                className="w-100"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" className="me-1" />
                    Saving...
                  </>
                ) : (
                  "Save Topic"
                )}
              </Button>
            </div>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
}
