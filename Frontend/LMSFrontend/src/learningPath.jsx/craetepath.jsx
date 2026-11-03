import React, { useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import Card from "react-bootstrap/Card";
import Spinner from "react-bootstrap/Spinner";

export default function CreatePath({ learningPath, setLearningPath, curUser }) {
    const [newLearningPath, setNewLearningPath] = useState({
        title: "",
        description: ""
    });
    const [submitting, setSubmitting] = useState(false);
    const [alertMessage, setAlertMessage] = useState({ type: "", text: "" });


    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewLearningPath((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setAlertMessage({ type: "", text: "" });

        if (!curUser) {
            setAlertMessage({
                type: "danger",
                text: "You must be logged in to create a learning path."
            });
            return;
        }

        if (!newLearningPath.title.trim() || !newLearningPath.description.trim()) {
            setAlertMessage({
                type: "danger",
                text: "Cannot create a path without either title or description."
            });
            return;
        }

        setSubmitting(true);

        try {
            const token = localStorage.getItem("token");

            const response = await fetch("http://localhost:5000/api/paths", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    title: newLearningPath.title, 
                    description: newLearningPath.description 
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || data.error || "Failed to create learning path");
            }

            setAlertMessage({
                type: "success",
                text: "Learning Path created successfully!"
            });

      
            setNewLearningPath({ title: "", description: "" });

            if (setLearningPath) {
                setLearningPath((prevPaths) => {
                    const standardArray = Array.isArray(prevPaths) ? prevPaths : [];
                    return [data, ...standardArray];
                });
            }

        } catch (error) {
            setAlertMessage({
                type: "danger",
                text: error.message || "An unexpected error occurred while creating the path."
            });
        } finally {
            setSubmitting(false);
        }
    };


       return (
    <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '80vh', 
        padding: '20px',
        backgroundColor: '#f8fafc' 
    }}>
        {/* Centered Modern Popped-out Learning Path Form Card */}
        <Card 
            style={{ 
                width: '100%', 
                maxWidth: '650px', // Slightly wider to comfortably fit the textarea description
                backgroundColor: '#ffffff', 
                padding: '24px', 
                borderRadius: '20px', 
                boxShadow: '0 15px 35px rgba(0, 0, 0, 0.06)', 
                border: '1px solid #e2e8f0' 
            }}
        >
            <Card.Body className="p-2">
                {/* Header Branding Area */}
                <div style={{ marginBottom: '28px' }}>
                    <Card.Title style={{ fontWeight: '800', color: '#1e293b', fontSize: '1.8rem', marginBottom: '6px' }}>
                        Create New Learning Path
                    </Card.Title>
                    {curUser && (
                        <Card.Subtitle style={{ color: '#64748b', fontSize: '14px', fontWeight: '500' }}>
                            Creating track as: <span style={{ color: '#1e293b', fontWeight: '600' }}>{curUser.email || curUser.username}</span>
                        </Card.Subtitle>
                    )}
                </div>

                {alertMessage.text && (
                    <div style={{ marginBottom: '20px', textAlign: 'left' }}>
                        <Alert 
                            variant={alertMessage.type} 
                            onClose={() => setAlertMessage({ type: "", text: "" })} 
                            dismissible
                            style={{ borderRadius: '10px' }}
                        >
                            {alertMessage.text}
                        </Alert>
                    </div>
                )}

                <Form onSubmit={handleSubmit}>
                    {/* Path Title Input Block */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginBottom: '24px', width: '100%' }}>
                        <Form.Label style={{ fontWeight: '700', color: '#475569', fontSize: '14px', marginBottom: '8px' }}>
                            Path Title
                        </Form.Label>
                        <Form.Control
                            type="text"
                            name="title"
                            placeholder="e.g., Full-Stack Web Development"
                            value={newLearningPath.title}
                            onChange={handleChange}
                            disabled={submitting}
                            required
                            style={{ 
                                width: '100%',
                                height: '48px', 
                                fontSize: '15px', 
                                padding: '12px 16px',
                                borderRadius: '10px',
                                border: '1px solid #cbd5e1',
                                backgroundColor: '#ffffff'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginBottom: '32px', width: '100%' }}>
                        <Form.Label style={{ fontWeight: '700', color: '#475569', fontSize: '14px', marginBottom: '8px' }}>
                            Description
                        </Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={5}
                            name="description"
                            placeholder="Provide a detailed roadmap description..."
                            value={newLearningPath.description}
                            onChange={handleChange}
                            disabled={submitting}
                            required
                            style={{ 
                                width: '100%',
                                fontSize: '15px', 
                                padding: '14px 16px',
                                borderRadius: '10px',
                                border: '1px solid #cbd5e1',
                                backgroundColor: '#ffffff',
                                resize: 'vertical',
                                lineHeight: '1.6'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                        <Button 
                            variant="success" 
                            type="submit" 
                            disabled={submitting}
                            style={{ 
                                height: '48px', 
                                padding: '0 32px',
                                fontSize: '15px', 
                                fontWeight: '700', 
                                borderRadius: '10px',
                                backgroundColor: '#198754',
                                border: 'none',
                                boxShadow: '0 4px 12px rgba(25, 135, 84, 0.2)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            {submitting ? (
                                <>
                                    <Spinner
                                        as="span"
                                        animation="border"
                                        size="sm"
                                        role="status"
                                        aria-hidden="true"
                                        className="me-2"
                                    />
                                    Creating...
                                </>
                            ) : (
                                "Create Path"
                            )}
                        </Button>
                    </div>
                </Form>
            </Card.Body>
        </Card>
    </div>
);

}
