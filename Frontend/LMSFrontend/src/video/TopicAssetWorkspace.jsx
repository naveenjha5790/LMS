import React, { useState, useEffect } from "react";
import { Form, Button, Spinner, Alert, Tabs, Tab } from "react-bootstrap";
import TopicAssessments from "../assessment/TopicAssessment";
import { useNavigate } from "react-router-dom";


export default function TopicAssetWorkspace({ topicId, curUser }) {
  const [activeTab, setActiveTab] = useState("videos");
  const [statusMsg, setStatusMsg] = useState({ type: "", text: "" });
    const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [videosLoading, setVideosLoading] = useState(false);
  const [videoFile, setVideoFile] = useState(null);
  const [sortOrder, setSortOrder] = useState(0);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  const isContributor = curUser?.role?.toUpperCase() === "CONTRIBUTOR";

  const loadVideos = async () => {
    if (!topicId) return;
    setVideosLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/${topicId}/uploadVideos`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }
      });
      const payload = await res.json();
      if (res.ok && payload.success) setVideos(payload.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setVideosLoading(false);
    }
  };

  const handleVideoUpload = async (e) => {
    e.preventDefault();
    if (!videoFile) return;
    setUploadingVideo(true);
    setStatusMsg({ type: "", text: "" });

    const formData = new FormData();
    formData.append("videoFile", videoFile);
    formData.append("sortOrder", String(sortOrder));

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/${topicId}/uploadVideos`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });
      const result = await res.json();

      if (res.ok && result.success) {
        setStatusMsg({ type: "success", text: "Video asset uploaded successfully!" });
        setVideoFile(null);
        setSortOrder(0);
        const fileInput = document.getElementById(`fileInput_${topicId}`);
        if (fileInput) fileInput.value = "";
        loadVideos();
      } else {
        setStatusMsg({ type: "danger", text: result.message || "Upload rejected." });
      }
    } catch (err) {
      setStatusMsg({ type: "danger", text: "Network streaming error encountered." });
    } finally {
      setUploadingVideo(false);
    }
  };

  useEffect(() => {
    setStatusMsg({ type: "", text: "" });
    if (activeTab === "videos") {
      loadVideos();
    }
  }, [topicId, activeTab]);

 return (
  <div style={{ maxWidth: '850px', margin: '40px auto', padding: '0 20px', width: '100%' }}>
    <div style={{
      backgroundColor: '#ffffff',
      padding: '32px',
      borderRadius: '16px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 12px 30px rgba(0, 0, 0, 0.08)' 
    }}>
      {statusMsg.text && (
        <Alert variant={statusMsg.type} className="py-2 px-3 small mb-4 border">
          {statusMsg.text}
        </Alert>
      )}

      <Tabs 
        activeKey={activeTab} 
        onSelect={(k) => setActiveTab(k)} 
        className="mb-4 border-bottom text-xs font-semibold"
        variant="pills"
      >
        <Tab eventKey="videos" title="📽️ Media Video Streams">
          {activeTab === "videos" && (
            <>
            
              {isContributor && (
                <Form 
                  onSubmit={handleVideoUpload} 
                  style={{
                    backgroundColor: '#f8fafc',
                    padding: '24px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
                    marginBottom: '28px'
                  }}
                >
                  <h6 style={{ fontWeight: '700', color: '#475569', marginBottom: '16px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Upload New Video Stream
                  </h6>
                  <div className="d-flex flex-wrap gap-3 align-items-end">
                    <Form.Group className="flex-grow-1 mb-0">
                      <Form.Label style={{ fontWeight: '600', color: '#64748b', fontSize: '13px' }}>Choose Video Source</Form.Label>
                      <Form.Control 
                        id={`fileInput_${topicId}`}
                        type="file" 
                        accept="video/*" 
                        size="sm" 
                        
                        onChange={(e) => { if (e.target.files?.length) setVideoFile(e.target.files[0]); }} 
                        required 
                        style={{ height: '42px', borderRadius: '8px', paddingTop: '8px' }}
                      />
                    </Form.Group>
                    <Form.Group className="mb-0" style={{ width: '100px' }}>
                      <Form.Label style={{ fontWeight: '600', color: '#64748b', fontSize: '13px' }}>Sequence</Form.Label>
                      <Form.Control 
                        type="number" 
                        placeholder="0" 
                        size="sm" 
                        value={sortOrder || ""} 
                        onChange={(e) => setSortOrder(Number(e.target.value))} 
                        style={{ height: '42px', borderRadius: '8px' }}
                      />
                    </Form.Group>
                    <Button 
                      type="submit" 
                      variant="primary" 
                      disabled={uploadingVideo}
                      style={{ height: '42px', padding: '0 24px', fontWeight: '600', borderRadius: '8px' }}
                    >
                      {uploadingVideo ? "Uploading..." : "Upload File"}
                    </Button>
                  </div>
                </Form>
              )}

              <div 
                style={{
                  backgroundColor: '#f8fafc',
                  padding: '24px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)'
                }}
              >
                <div style={{ fontWeight: '700', color: '#475569', marginBottom: '16px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Active Stream Items Detail:
                </div>
                
                {videosLoading ? (
                  <div className="text-center py-4"><Spinner animation="border" size="sm" variant="primary" /></div>
                ) : videos.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {videos.map((vid) => (
                      <div 
                        key={vid.id} 
                        style={{ 
                          backgroundColor: '#ffffff',
                          padding: '16px 20px',
                          border: '1px solid #e2e8f0',
                          borderRadius: '10px',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#334155' }} className="text-truncate me-3">
                          🎞️ {vid.filename}
                        </span>
                        <a 
                          href={vid.url} 
                          target="_blank" 
                          rel="noreferrer" 
                          style={{ fontWeight: '700', padding: '6px 14px', borderRadius: '6px', fontSize: '13px' }}
                          className="btn btn-outline-primary btn-sm shrink-0 text-decoration-none"
                        >
                          Play Stream ↗
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted py-4 fst-italic style-sm" style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px dashed #cbd5e1' }}>
                    No video files recorded inside this workspace yet.
                  </div>
                )}
              </div>
            </>
          )}
        </Tab>

        <Tab eventKey="assessments" title="📝 Evaluations & Assessments">
          {activeTab === "assessments" && (
            <div style={{ marginTop: '10px' }}>
              <TopicAssessments topicId={topicId} isLMSManager={isContributor} />
            </div>
          )}
        </Tab>
      </Tabs>
    </div>
  </div>
);


}
