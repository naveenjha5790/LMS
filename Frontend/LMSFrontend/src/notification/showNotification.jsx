import React, { useState, useEffect } from "react";
import { Button, Card, ListGroup, Badge, Spinner, Alert, Collapse } from "react-bootstrap";

export default function NotificationWorkspace({ curUser }) {

  const [showPanel, setShowPanel] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState(null);


  const fetchNotifications = async () => {
    if (!curUser) return;
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/notifications", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load your notifications ledger.");
      }
   
      setNotifications(data.notifications || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (showPanel) {
      fetchNotifications();
    }
  }, [showPanel]);

  const handleItemClick = async (notificationItem) => {
    const nId = notificationItem.id || notificationItem._id;

    if (expandedId === nId) {
      setExpandedId(null);
      return;
    } else {
      setExpandedId(nId);
    }


    if (notificationItem.isRead) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/${nId}/markAsRead`, {
        method: "PATCH", 
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (response.ok) {

        setNotifications(prev =>
          prev.map(n => (n.id === nId || n._id === nId) ? { ...n, isRead: true } : n)
        );
      }
    } catch (err) {
      console.error("Failed to sync read status marker on server:", err);
    }
  };


  const handleMarkAllRead = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/notifications/markAllAsRead", {
        method: "PATCH",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("Batch processing transactions failure.");


      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="mb-4">

      <Button 
        variant={unreadCount > 0 ? "primary" : "outline-secondary"} 
        className="fw-bold d-flex align-items-center gap-2 shadow-sm mb-3"
        onClick={() => setShowPanel(!showPanel)}
      >
        <span>🔔 {showPanel ? "Hide Notifications" : "Show Notifications"}</span>
        {unreadCount > 0 && <Badge bg="danger" pill>{unreadCount}</Badge>}
      </Button>


      <Collapse in={showPanel}>
        <div className="mt-2">
          <Card className="shadow-sm border-0 bg-white">
            <Card.Header className="bg-light d-flex justify-content-between align-items-center py-3 border-bottom">
              <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                <span>Notification Feed Hub</span>
                <Badge bg="secondary" size="sm">{notifications.length} Total</Badge>
              </h6>
              
              {unreadCount > 0 && (
                <Button 
                  variant="outline-primary" 
                  size="sm" 
                  className="fw-semibold py-1 px-3 text-xs"
                  onClick={handleMarkAllRead}
                  disabled={loading}
                  style={{ fontSize: "12px" }}
                >
                  ✓ Mark All as Read
                </Button>
              )}
            </Card.Header>

            <Card.Body className="p-2" style={{ maxHeight: "350px", overflowY: "auto" }}>
              {error && <Alert variant="danger" className="m-2 py-2 small">{error}</Alert>}
              
              {loading && notifications.length === 0 ? (
                <div className="text-center py-4">
                  <Spinner animation="border" size="sm" variant="primary" className="me-2" />
                  <span className="text-muted small">Streaming notifications ledger...</span>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-4 text-muted small italic">Your notification inbox is currently clear.</div>
              ) : (
                <ListGroup variant="flush">
                  {notifications.map((item) => {
                    const itemId = item.id || item._id;
                    const isExpanded = expandedId === itemId;

                    return (
                      <div key={itemId} className="border-bottom last-border-0">

                        <ListGroup.Item
                          action
                          onClick={() => handleItemClick(item)}
                          className={`d-flex align-items-center justify-content-between border-0 py-3 cursor-pointer ${
                            item.isRead ? "bg-white text-secondary" : "bg-light text-dark fw-bold border-start border-3 border-primary"
                          }`}
                        >
                          <div className="d-flex align-items-center gap-3 text-truncate">
                            <span style={{ fontSize: "16px" }}>{item.isRead ? "✉️" : "📩"}</span>
                            <div className="text-truncate small" style={{ fontSize: "13.5px" }}>
                              {item.title || "New Platform Update Notification"}
                            </div>
                          </div>
                          
                          <div className="d-flex align-items-center gap-2 ms-2 shrink-0">
                            <span className="text-muted text-xs block" style={{ fontSize: "10px" }}>
                              {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ""}
                            </span>
                            {!item.isRead && <Badge bg="primary" pill style={{ fontSize: "9px" }}>New</Badge>}
                          </div>
                        </ListGroup.Item>

                        <Collapse in={isExpanded}>
                          <div className="bg-white p-3 border-top px-4 text-secondary small bg-light-subtle" style={{ fontSize: "13px", lineHeight: "1.6" }}>
                            <div className="text-dark fw-semibold mb-1">Message Details:</div>
                            <p className="mb-0 text-break">{item.message || item.content || "No details provided for this entry."}</p>
                          </div>
                        </Collapse>
                      </div>
                    );
                  })}
                </ListGroup>
              )}
            </Card.Body>
          </Card>
        </div>
      </Collapse>
    </div>
  );
}
