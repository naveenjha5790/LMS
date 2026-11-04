import React, { useState } from "react";
import { Button, Spinner } from "react-bootstrap";

/**
 *
 * 
 * @param {String} topicId - The target unique Topic ID reference (req.params.tid)
 * @param {String} currentStatus - The current status string of the topic node (e.g., 'DRAFT_CONTENT')
 * @param {Object} curUser - Logged-in profile session token metadata context object
 * @param {Function} onSetAlert - Callback handler to bubble up success/error notification banners to parent view
 * @param {Function} onRefreshTopics - Callback handler to instantly re-index parent view layout states upon success
 */
export default function SubmitTopicContentButton({ 
  topicId, 
  currentStatus, 
  curUser, 
  onSetAlert,
  onRefreshTopics
}) {
  const [submitting, setSubmitting] = useState(false);


  const isContributor = curUser?.role?.toUpperCase() === "CONTRIBUTOR";

  const isEligibleStatus = currentStatus === "DRAFT_CONTENT" || currentStatus === "DRAFT";


  if (!isContributor || !isEligibleStatus) return null;

  const handleContentSubmission = async (e) => {

    e.stopPropagation();

    setSubmitting(true);
    if (onSetAlert) onSetAlert({ type: "", text: "" });

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`http://localhost:5000/api/${topicId}/approvalRequest`, {
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
            text: data.message || "Content successfully sent to moderator for approval!" 
          });
        }
    
        if (onRefreshTopics) onRefreshTopics();
      } else {
       
        if (onSetAlert) {
          onSetAlert({ 
            type: "danger", 
            text: data.message || "Failed to dispatch approval workflow." 
          });
        }
      }
    } catch (err) {
      console.error("Content approval dispatcher pipeline failure caught:", err);
      if (onSetAlert) {
        onSetAlert({ type: "danger", text: "Network connection loss or timeout encountered." });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Button
      variant="warning"
      size="sm"
      className="fw-bold"
      style={{ 
        fontSize: "10px", 
        padding: "2px 8px", 
        color: "#000000",
        boxShadow: "0 2px 4px rgba(255, 193, 7, 0.15)"
      }}
      disabled={submitting}
      onClick={handleContentSubmission}
    >
      {submitting ? (
        <>
          <Spinner animation="border" size="sm" role="status" className="me-1" style={{ width: "10px", height: "10px" }} />
          Sending...
        </>
      ) : (
        "🚀 Submit Content"
      )}
    </Button>
  );
}
