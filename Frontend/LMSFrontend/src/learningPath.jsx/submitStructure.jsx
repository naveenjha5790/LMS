import React, { useState } from "react";
import { Button, Spinner } from "react-bootstrap";

/**
 * SubmitStructureButton isolates the structure submission network lifecycle.
 * Maps cleanly to your backend submitStructure Express controller.
 * 
 * @param {String} pathId - The target LearningPath unique ID (req.params.id)
 * @param {String} status - The current operational status of the path
 * @param {Boolean} isManager - Security context flag derived from user profile
 * @param {Function} onSubmissionSuccess - Callback handler to refresh parent data state arrays
 * @param {Function} onSetAlert - Callback handler to bubble up messaging alerts into main workspace
 */
export default function SubmitStructureButton({ 
  pathId, 
  status, 
  isManager, 
  onSubmissionSuccess, 
  onSetAlert 
}) {
  const [submitting, setSubmitting] = useState(false);

  // Structural restrictions check matching your validation rules
  const isDraft = status?.toUpperCase() === "DRAFT";

  // Hide entirely if user profile lacks manager role or status isn't clear DRAFT
  if (!isManager || !isDraft) return null;

  const handleStructureSubmission = async (e) => {
    // ─── STOP EVENT PROPAGATION ───
    // Prevents clicking this nested button from opening card details or page redirects
    e.stopPropagation(); 
    
    setSubmitting(true);
    if (onSetAlert) onSetAlert({ type: "", text: "" });

    try {
      const token = localStorage.getItem("token");
      
      // Connects directly to backend: app.post('/api/:id/submit-structure', submitStructure)
      const response = await fetch(`http://localhost:5000/api/paths/${pathId}/submitStructure`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        if (onSetAlert) {
          onSetAlert({ 
            type: "success", 
            text: data.message || "Structure sent to moderator for approval!" 
          });
        }
        
        // Notify parent state array to transform item status values locally
        if (onSubmissionSuccess) {
          onSubmissionSuccess(pathId);
        }
      } else {
        if (onSetAlert) {
          onSetAlert({ 
            type: "danger", 
            text: data.message || "Failed to submit structure configuration." 
          });
        }
      }
    } catch (err) {
      console.error("Submission exception caught:", err);
      if (onSetAlert) {
        onSetAlert({ 
          type: "danger", 
          text: "Network pipeline transmission exception encountered." 
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Button
      variant="success"
      size="sm"
      className="d-flex align-items-center gap-1.5 font-semibold text-xs px-3 py-2 shadow-3xs"
      disabled={submitting}
      onClick={handleStructureSubmission}
    >
      {submitting ? (
        <>
          <Spinner animation="border" size="sm" role="status" className="me-1" />
          Submitting...
        </>
      ) : (
        <>
          
          "Submit Structure"
        </>
      )}
    </Button>
  );
}
