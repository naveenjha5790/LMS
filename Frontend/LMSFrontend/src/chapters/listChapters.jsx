import React from "react";
import { Badge, Button, Form, Spinner, Pagination } from "react-bootstrap";
import TopicAssetWorkspace from "../video/TopicAssetWorkspace"; 
import SubmitTopicContentButton from "../topic/askforApproval"; // Ensure this is imported correctly

export default function ShowChapters({ chaptersList, curUser, subjectId }) {
  const [expandedChapterId, setExpandedChapterId] = React.useState(null);
  const [activeTopicWorkspaceId, setActiveTopicWorkspaceId] = React.useState(null);

  const [topics, setTopics] = React.useState([]);
  const [topicsLoad, setTopicsLoad] = React.useState(false);
  const [topicPage, setTopicPage] = React.useState(1);
  const [topicMeta, setTopicMeta] = React.useState({ total_pages: 1, total_records: 0 });

  const [activeTopicFormId, setActiveTopicFormId] = React.useState(null);
  const [newTopic, setNewTopic] = React.useState({ title: "", order: 0 });
  const [submittingTopic, setSubmittingTopic] = React.useState(false);

  const isManager = curUser?.role?.toUpperCase() === "LMS_MANAGER" || curUser?.role?.toUpperCase() === "MANAGER";

  const fetchTopics = async (chapterId, targetPage = 1) => {
    setTopicsLoad(true);
    try {
      const token = localStorage.getItem("token");
      
      const response = await fetch(`http://localhost:5000/api/${chapterId}/topics?page=${targetPage}&limit=5`, {
        method: "GET",
        headers: { 
          "Content-Type": "application/json", 
          "Authorization": `Bearer ${token}` 
        }
      });
      const data = await response.json();
      
      setTopics(data.paths || []); 
      setTopicMeta(data.meta || { total_pages: 1, total_records: 0 });
      setTopicPage(data.meta?.current_page || targetPage);
    } catch (err) {
      console.error("Error retrieving topic collections:", err);
    } finally {
      setTopicsLoad(false);
    }
  };

  // ─── CRITICAL FIX: TRIGGER FETCH ON VIEW TOGGLE ───
  const toggleTopicsView = (chapterId) => {
    if (expandedChapterId === chapterId) {
      setExpandedChapterId(null);
      setActiveTopicWorkspaceId(null); 
      setTopics([]); // Clear out stale data on close
    } else {
      setExpandedChapterId(chapterId);
      setActiveTopicFormId(null); 
      fetchTopics(chapterId, 1); // 💡 Directly fetch first page of topics on open
    }
  };

  const handleTopicSubmit = async (e, chapterId) => {
    e.preventDefault();
    if (!newTopic.title.trim()) return;
    setSubmittingTopic(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/${chapterId}/topics`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ title: newTopic.title, order: Number(newTopic.order) })
      });
      
      if (response.ok) {
        setNewTopic({ title: "", order: 0 });
        setActiveTopicFormId(null);
        setExpandedChapterId(chapterId);
        fetchTopics(chapterId, 1); // Triggers re-fetch on new submission
      }
    } catch (err) {
      console.error("Error creating new topic record:", err);
    } finally {
      setSubmittingTopic(false);
    }
  };

  if (!chaptersList || chaptersList.length === 0) {
    return <div className="text-center p-2 text-muted border rounded small border-dashed">No chapters structured here yet.</div>;
  }
  return (
  <div style={{ maxWidth: '850px', margin: '40px auto', padding: '0 20px', width: '100%' }}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {chaptersList.map((chap) => (
        <div 
          key={chap.id} 
          style={{ 
            backgroundColor: '#ffffff', 
            padding: '24px 28px', 
            borderRadius: '16px', 
            border: '1px solid #e2e8f0', 
            boxShadow: '0 12px 28px rgba(0, 0, 0, 0.06)', 
            transform: 'translateY(-1px)',
            transition: 'all 0.25s ease-in-out'
          }}
        >
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            flexWrap: 'wrap',
            gap: '16px',
            borderBottom: (activeTopicFormId === chap.id || expandedChapterId === chap.id) ? '1px solid #f1f5f9' : 'none',
            paddingBottom: (activeTopicFormId === chap.id || expandedChapterId === chap.id) ? '16px' : '0'
          }}>
            <span style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
              📖 {chap.title}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Badge bg="secondary" style={{ padding: '8px 14px', fontSize: '0.85rem', fontWeight: '600', borderRadius: '6px' }}>
                Order: {chap.order}
              </Badge>
              <Button 
                variant="outline-dark" 
                size="sm" 
                style={{ padding: '8px 16px', fontSize: '13px', fontWeight: '600', borderRadius: '8px' }} 
                onClick={() => toggleTopicsView(chap.id)}
              >
                {expandedChapterId === chap.id ? "Hide Topics" : "View Topics"}
              </Button>
              {isManager && (
                <Button 
                  variant="success" 
                  size="sm" 
                  style={{ padding: '8px 16px', fontSize: '13px', fontWeight: '600', borderRadius: '8px' }} 
                  onClick={() => setActiveTopicFormId(activeTopicFormId === chap.id ? null : chap.id)}
                >
                  + Add Topic
                </Button>
              )}
            </div>
          </div>

          {activeTopicFormId === chap.id && (
            <Form 
              onSubmit={(e) => handleTopicSubmit(e, chap.id)} 
              style={{ 
                marginTop: '20px', 
                padding: '20px', 
                backgroundColor: '#f8fafc', 
                border: '1px solid #e2e8f0', 
                borderRadius: '12px' 
              }}
            >
              <h6 style={{ fontWeight: '700', color: '#475569', marginBottom: '14px', fontSize: '13px', textTransform: 'uppercase', trackingWider: '0.05em' }}>
                Create New Topic
              </h6>
              <div className="row g-3 align-items-center">
                <div className="col-sm-7">
                  <Form.Control 
                    type="text" 
                    placeholder="Topic Name" 
                    value={newTopic.title} 
                    onChange={(e) => setNewTopic(prev => ({ ...prev, title: e.target.value }))} 
                    required 
                    style={{ height: '40px', borderRadius: '8px' }}
                  />
                </div>
                <div className="col-sm-3">
                  <Form.Control 
                    type="number" 
                    placeholder="Order Position" 
                    value={newTopic.order || ""} 
                    onChange={(e) => setNewTopic(prev => ({ ...prev, order: e.target.value }))} 
                    style={{ height: '40px', borderRadius: '8px' }}
                  />
                </div>
                <div className="col-sm-2">
                  <Button variant="success" type="submit" className="w-100" disabled={submittingTopic} style={{ height: '40px', fontWeight: '600', borderRadius: '8px' }}>
                    {submittingTopic ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>
            </Form>
          )}

          {expandedChapterId === chap.id && (
            <div style={{ marginTop: '20px', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <h6 style={{ fontWeight: '700', color: '#64748b', marginBottom: '16px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Topics Workspace:
              </h6>
              
              {topicsLoad ? (
                <div className="text-center py-4"><Spinner animation="border" size="sm" variant="primary" /></div>
              ) : topics.length > 0 ? (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {topics.map((top) => (
                      <div 
                        key={top.id} 
                        style={{ 
                          padding: '16px 20px', 
                          border: '1px solid #e2e8f0', 
                          borderRadius: '10px', 
                          backgroundColor: '#ffffff',
                          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.02)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '1rem', fontWeight: '600', color: '#334155' }}>
                            🔹 {top.title}
                            {/* Inline structural workflow context badge text tracking token */}
                            <small style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace', marginLeft: '8px' }}>
                              ({top.status || "DRAFT"})
                            </small>
                          </span>
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            
                            {/* ─── WORKFLOW SUBMIT CONTENT FOR APPROVAL BUTTON COMPONENT ─── */}
                            <SubmitTopicContentButton 
                              topicId={top.id}
                              currentStatus={top.status}
                              curUser={curUser}
                              onSetAlert={(alertObj) => alert(alertObj.text)}
                              onRefreshTopics={() => fetchTopics(chap.id, topicPage)}
                            />

                            <span className="badge bg-light text-dark border style-sm" style={{ padding: '6px 10px', fontSize: '11px', fontWeight: '500', borderRadius: '4px' }}>
                              Order: {top.order}
                            </span>
                            <Button 
                              variant="outline-primary" 
                              size="sm" 
                              style={{ padding: '6px 14px', fontSize: '12px', fontWeight: '600', borderRadius: '6px' }}
                              onClick={() => setActiveTopicWorkspaceId(activeTopicWorkspaceId === top.id ? null : top.id)}
                            >
                              {activeTopicWorkspaceId === top.id ? "Hide Assets" : "Manage Assets"}
                            </Button>
                          </div>
                        </div>
                        {activeTopicWorkspaceId === top.id && (
                          <div style={{ marginTop: '16px', backgroundColor: '#f8fafc', padding: '16px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                            <TopicAssetWorkspace topicId={top.id} curUser={curUser} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {topicMeta.total_pages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                      <Pagination size="sm" className="mb-0">
                        {[...Array(topicMeta.total_pages)].map((_, idx) => (
                          <Pagination.Item 
                            key={idx + 1} 
                            active={idx + 1 === topicPage} 
                            onClick={() => fetchTopics(chap.id, idx + 1)}
                          >
                            {idx + 1}
                          </Pagination.Item>
                        ))}
                      </Pagination>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-3 text-muted small fst-italic" style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                  No topics mapped inside yet.
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
);

}
