import React from "react";
import { Alert, Button, Form } from "react-bootstrap";

export default function CreateChapter({ subject, curUser, chapter, setChapter }) {
  const [create, setCreate] = React.useState(false);
  const [newChapter, setNewChapter] = React.useState({
    title: "",
    order: 0,
  });
  const [alertMessage, setAlertMessage] = React.useState({
    type: "",
    text: "",
  });
  const [submit, setSubmit] = React.useState(false);

  function handleChange(st) {
    const { name, value } = st.target;

    setNewChapter((prevs) => ({
      ...prevs,
      [name]: name === "order" ? parseInt(value, 10) || 0 : value, 
    }));
  }

  async function inputHandler(e) {
    e.preventDefault();
    const subId = subject?.id;

    if (!subId) {
      setAlertMessage({ type: "danger", text: "Subject validation context missing." });
      return;
    }
    if (!newChapter.title.trim()) return;
    
    setSubmit(true);
    setAlertMessage({ type: "", text: "" });

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/${subId}/chapters`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },

        body: JSON.stringify({
          title: newChapter.title,
          order: newChapter.order,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add chapter! Please try again");
      }

      setChapter((prevChapter) => [...prevChapter, data]);

      setAlertMessage({ type: "success", text: "Chapter created successfully!" });
      setNewChapter({ title: "", order: 0 });
      setCreate(false);
    } catch (error) {
      setAlertMessage({ type: "danger", text: error.message });
    } finally {
      setSubmit(false);
    }
  }

  return (
    <div style={{ maxWidth: '700px', margin: '40px auto', padding: '0 20px', width: '100%', textAlign: 'center' }}>
  {alertMessage.text && (
    <div style={{ textAlign: 'left', marginBottom: '20px' }}>
      <Alert variant={alertMessage.type} onClose={() => setAlertMessage({ type: "", text: "" })} dismissible>
        {alertMessage.text}
      </Alert>
    </div>
  )}

  {!create ? (
    <Button 
      variant="success" 
      onClick={() => setCreate(true)}
      style={{ padding: '12px 28px', fontWeight: '700', borderRadius: '8px', boxShadow: '0 4px 12px rgba(40, 167, 69, 0.2)' }}
    >
      ➕ Add New Chapter
    </Button>
  ) : (

    <Form 
      onSubmit={inputHandler} 
      style={{ 
        textAlign: 'left', 
        backgroundColor: '#ffffff', 
        padding: '32px', 
        borderRadius: '16px', 
        border: '1px solid #e2e8f0', 
        boxShadow: '0 12px 28px rgba(0, 0, 0, 0.08)',
        marginBottom: '30px'
      }}
    >
      <h3 style={{ fontWeight: '700', fontSize: '1.4rem', color: '#1e293b', marginBottom: '24px' }}>
        Add New Chapter to <span style={{ color: '#28a745' }}>{subject?.title || "Subject"}</span>
      </h3>
      
      <Form.Group className="mb-4" controlId="chapterTitle">
        <Form.Label style={{ fontWeight: '600', color: 'darkcyan', fontSize: '14px',marginRight:"20px" }}>Chapter Title    </Form.Label>
        <Form.Control
          type="text"
          name="title"
          value={newChapter.title}
          onChange={handleChange}
          placeholder="e.g., Introduction to Variables"
          required
          disabled={submit}
          style={{ height: '44px', borderRadius: '8px',paddingLeft:"15px" }}
        />
      </Form.Group>

      <Form.Group className="mb-4" controlId="chapterOrder">
        <Form.Label style={{ fontWeight: '600', color: 'darkcyan', fontSize: '14px',marginRight:"20px" }}>Sorting Order    </Form.Label>
        <Form.Control
          type="number"
          name="order"
          value={newChapter.order}
          onChange={handleChange}
          placeholder="0"
          disabled={submit}
          style={{ height: '44px', borderRadius: '8px' ,paddingLeft:"20px"}}
        />
      </Form.Group>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
        <Button 
          variant="secondary" 
          onClick={() => setCreate(false)} 
          disabled={submit}
          style={{ padding: '10px 20px', fontWeight: '600', borderRadius: '8px' }}
        >
          Cancel
        </Button>
        <Button 
          variant="success" 
          type="submit" 
          disabled={submit}
          style={{ padding: '10px 24px', fontWeight: '600', borderRadius: '8px' }}
        >
          {submit ? "Adding..." : "Save Chapter"}
        </Button>
      </div>
    </Form>
  )}
  <div style={{ marginTop: '24px', textAlign: 'left' }}>
    {chapter && chapter.length > 0 && (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {chapter
          .sort((a, b) => a.order - b.order)
          .map((chap) => (
            <div 
              key={chap.id || chap._id} 
              style={{ 
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#ffffff',
                padding: '18px 24px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.05)',
                transform: 'translateY(-1px)'
              }}
            >
              <span style={{ fontWeight: '600', color: '#1e293b', fontSize: '1.05rem' }}>
                📖 {chap.title}
              </span>
              <span 
                className="badge bg-light text-dark border" 
                style={{ padding: '8px 14px', fontSize: '0.85rem', fontWeight: '600', borderRadius: '6px' }}
              >
                Order: {chap.order}
              </span>
            </div>
          ))}
      </div>
    )}
  </div>
</div>

  );
}
