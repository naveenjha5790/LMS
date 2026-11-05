import React, { useState } from "react";
import { Modal, Button, Ratio, Spinner, Alert, ListGroup, Tabs, Tab } from "react-bootstrap";
import StudentQuizModal from "../Questions/viewQuestions";

export default function TopicContentViewer({ topicItem, pathTitle }) {
  const [showViewer, setShowViewer] = useState(false);

  const [videos, setVideos] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [activeVideo, setActiveVideo] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [selectedAssessmentForQuiz, setSelectedAssessmentForQuiz] = useState(null);


  const markedRef = React.useRef(new Set());

  const topicId = topicItem?.id || topicItem?._id;

  const getVideoUrl = (vid) => vid?.contentUrl || vid?.fileUrl || vid?.url || "";


  const handleOpenViewer = async () => {
    setShowViewer(true);
    setLoading(true);
    setError("");
    setActiveVideo(null);
    setVideos([]);
    setAssessments([]);

    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [videoRes, assessmentRes] = await Promise.all([
        fetch(`http://localhost:5000/api/${topicId}/uploadVideos`, { headers }),
        fetch(`http://localhost:5000/api/${topicId}/assessments`, { headers })
      ]);

      const videoData = await videoRes.json();
      const assessmentData = await assessmentRes.json();

      if (videoRes.ok && videoData.success) {
        const list = videoData.data || [];
        setVideos(list);

        if (list.length > 0) setActiveVideo(list[0]);
      }

      if (assessmentRes.ok) {
        setAssessments(assessmentData.paths || []);
      }
    } catch (err) {
      console.error("Content retrieval failure:", err);
      setError("Failed to stream classroom media resources.");
    } finally {
      setLoading(false);
    }
  };


  const handleMarkVideoAsDone = async (videoItem) => {
    const videoId = videoItem?.id || videoItem?._id;
    if (!videoId) return;

    if (markedRef.current.has(videoId)) return;
    markedRef.current.add(videoId);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/video/${videoId}`, {
        method: "PATCH", 
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("videoDone failed:", response.status, data);
        markedRef.current.delete(videoId); 
        return;
      }
      console.log("Progress updated:", data);
    } catch (err) {
      console.error("Failed to sync media play markers:", err);
      markedRef.current.delete(videoId);
    }
  };

  const triggerQuizWorkflow = (assessmentItem) => {
    setSelectedAssessmentForQuiz(assessmentItem);
    setQuizModalOpen(true);
  };

  const activeVideoUrl = getVideoUrl(activeVideo);

  return (
    <>
      <Button
        variant="outline-dark"
        size="sm"
        className="mt-2 py-1 px-2 fw-semibold w-100"
        style={{ fontSize: "12px" }}
        onClick={handleOpenViewer}
      >
        📖 Access Lesson Materials
      </Button>

      <Modal show={showViewer} onHide={() => setShowViewer(false)} size="xl" centered>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="h6 fw-bold text-dark mb-0">
            Topic Workspace: <span className="text-primary">{topicItem?.title || "Classroom Portal"}</span>
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="p-3">
          {error && <Alert variant="danger">{error}</Alert>}

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" className="mb-2" />
              <p className="text-muted small">Loading media files & assignments...</p>
            </div>
          ) : (
            <Tabs defaultActiveKey="videos" className="mb-3 fw-bold">
              {/* TAB 1: VIDEO LESSON PLAYER */}
              <Tab eventKey="videos" title={`📹 Video Lessons (${videos.length})`}>
                {videos.length === 0 ? (
                  <Alert variant="info" className="my-2 small">
                    No streaming video content matches this topic layout.
                  </Alert>
                ) : (
                  <div className="row g-3 mt-1">
                    {/* Player */}
                    <div className="col-lg-8">
                      {activeVideoUrl ? (
                        <div className="shadow rounded overflow-hidden bg-dark">
                          <Ratio aspectRatio="16x9">
                            <video
                              key={activeVideoUrl}  
                              src={activeVideoUrl}
                              controls
                              preload="metadata"   
                              onPlay={() => handleMarkVideoAsDone(activeVideo)}
                            />
                          </Ratio>
                        </div>
                      ) : (
                        <div className="bg-light text-center py-5 border rounded small text-muted">
                          Select a video lesson to begin playback
                        </div>
                      )}
                    </div>

                    <div className="col-lg-4">
                      <h6 className="fw-bold text-secondary mb-2 small">Course Playlist Tracks:</h6>
                      <ListGroup size="sm" className="overflow-auto" style={{ maxHeight: "360px" }}>
                        {videos.map((vid, idx) => (
                          <ListGroup.Item
                            key={vid.id || vid._id || idx}
                            action
                            active={activeVideoUrl === getVideoUrl(vid)}
                            onClick={() => setActiveVideo(vid)}
                            className="small text-truncate py-2"
                          >
                            <div className="fw-semibold">{idx + 1}. {vid.filename || "Untitled Video"}</div>
                            
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    </div>
                  </div>
                )}
              </Tab>

  
              <Tab eventKey="assessments" title={`📝 Assessments & Homework (${assessments.length})`}>
                {assessments.length === 0 ? (
                  <Alert variant="info" className="my-2 small">
                    No assignment test modules published for this topic layout.
                  </Alert>
                ) : (
                  <div className="mt-2 overflow-auto" style={{ maxHeight: "400px" }}>
                    <ListGroup variant="flush">
                      {assessments.map((asm, idx) => {
                        const fileLink = asm.contentUrl || asm.fileUrl || asm.url;
                        return (
                          <ListGroup.Item
                            key={asm.id || idx}
                            className="d-flex justify-content-between align-items-center py-3 border-bottom px-2"
                          >
                            <div>
                              <div className="fw-bold text-dark small">{asm.title}</div>
                              {asm.description && (
                                <p className="text-muted mb-0 small" style={{ fontSize: "11px" }}>
                                  {asm.description}
                                </p>
                              )}
                            </div>
                            {fileLink && (
                              <Button
                                href={fileLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                variant="outline-success"
                                size="sm"
                                className="fw-bold text-xs"
                                style={{ fontSize: "12px" }}
                              >
                                📥 Open Assessment
                              </Button>
                            )}
                            <Button
                              variant="success"
                              size="sm"
                              className="fw-bold px-3 text-xs"
                              style={{ fontSize: "12px" }}
                              onClick={() => triggerQuizWorkflow(asm)}
                            >
                              ✍️ Attempt Live Quiz
                            </Button>
                          </ListGroup.Item>
                        );
                      })}
                    </ListGroup>
                  </div>
                )}
              </Tab>
            </Tabs>
          )}
        </Modal.Body>

        <Modal.Footer className="bg-light py-2">
          <Button variant="secondary" size="sm" className="fw-semibold" onClick={() => setShowViewer(false)}>
            Close Viewport Workspace
          </Button>
        </Modal.Footer>
      </Modal>

      <StudentQuizModal
        show={quizModalOpen}
        onHide={() => setQuizModalOpen(false)}
        assessment={selectedAssessmentForQuiz}
        topicId={topicId}
        pathTitle={pathTitle}
      />
    </>
  );
}