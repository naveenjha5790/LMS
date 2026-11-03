import React from "react";
import { Alert, Button, Form } from "react-bootstrap";
export default function CreateSubject({subject,setSubject,curUser,learningPath}){
    const [create,setCreate]=React.useState(false);
    const [newSubject,setNewSubject]=React.useState({
        title:"",order:0
    })
    const [alertMessage, setAlertMessage]=React.useState({
        type:"",
        text:""
    })
    const [submit,setSubmit]=React.useState(false);
    function handleChange(st){
    const {name,value}=st.target;
    setNewSubject((prevs)=>({
        ...prevs,
        [name]:value
    }));
  }
   async function inputHandler(e){
        e.preventDefault();
        const pathId=learningPath.id;

         if (!newSubject.title.trim()) return;
        setSubmit(true);
        try{
            const token=localStorage.getItem("token");
            const response=await fetch(`http://localhost:5000/api/${pathId}/subject`,{
                method:"POST",
                headers:{
                    "content-Type":"application/json",
                    "Authorization":`Bearer ${token}`
                },
                body: JSON.stringify({title:newSubject.title,
                    order: parseInt(newSubject.order, 10) || 0 
                })
            })
            const data= await response.json();
            if (!response.ok) throw new Error("Failed to add subject! please try again");
            setSubject((prevSubjects) => [...prevSubjects, data]);

      setAlertMessage({ type: "success", text: "Subject created successfully!" });
      setNewSubject({ title: "", order: 0 });
      setCreate(false);
    } catch (error) {
      setAlertMessage({ type: "danger", text: error.message });
    } finally {
      setSubmit(false);
    }
  }
  return (

  <div className="container mt-4">
    
      {alertMessage.text && (
        <Alert variant={alertMessage.type} onClose={() => setAlertMessage({ type: "", text: "" })} dismissible>
          {alertMessage.text}
        </Alert>
      )}

     <div style={{ maxWidth: '600px', margin: '30px auto', padding: '0 20px', textAlign: 'center' }}>
  {!create ? (
    <Button 
      variant="primary" 
      onClick={() => setCreate(true)}
      style={{ 
        padding: '12px 30px', 
        fontWeight: 'bold', 
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(13, 110, 253, 0.2)' 
      }}
    >
      ➕ Add New Subject
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
        boxShadow: '0 12px 28px rgba(0, 0, 0, 0.08)'
      }}
    >
      <h2 style={{ fontWeight: '700', marginBottom: '24px', color: 'green' }}>
        Create New Subject
      </h2>
      
      <Form.Group className="mb-4" controlId="subjectTitle">
        <Form.Label style={{ fontWeight: '600', color: 'darkcyan' }}>Subject Title  </Form.Label>
        <Form.Control
          type="text"
          name="title"
          value={newSubject.title}
          onChange={handleChange}
          placeholder="Enter subject title"
          required
          style={{ height: '44px', borderRadius: '8px' ,margin:"15px"}}
        />
      </Form.Group>

      <Form.Group className="mb-4" controlId="subjectOrder">
        <Form.Label style={{ fontWeight: '600', color: 'darkcyan' }}>Order Sequence  </Form.Label>
        <Form.Control
          type="number"
          name="order"
          value={newSubject.order}
          onChange={handleChange}
          placeholder="0"
          style={{ height: '44px', borderRadius: '8px' ,margin:"15px" ,justifyContent:"center",paddingLeft:"20px"}}
        />
      </Form.Group>

      <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
        <Button 
          variant="success" 
          type="submit" 
          disabled={submit}
          style={{ padding: '10px 20px', fontWeight: '600', borderRadius: '8px', flexGrow: 1 }}
        >
          {submit ? "Creating..." : "Save Subject"}
        </Button>
        <Button 
          variant="secondary" 
          onClick={() => setCreate(false)} 
          disabled={submit}
          style={{ padding: '10px 20px', fontWeight: '600', borderRadius: '8px' }}
        >
          Cancel
        </Button>
      </div>
    </Form>
  )}
</div>


      <div className="mt-4" style={{ maxWidth: '750px', margin: '40px auto', padding: '0 20px' }}>
  {subject && subject.length > 0 ? (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {subject
        .sort((a, b) => a.order - b.order)
        .map((sub) => (
          <div 
            key={sub.id || sub._id} 
            style={{ 
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#ffffff',
              padding: '18px 24px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 10px 20px rgba(0, 0, 0, 0.06)',
              transform: 'translateY(-1px)',
              transition: 'all 0.2s ease-in-out'
            }}
          >
            <span style={{ fontWeight: '600', color: '#1e293b', fontSize: '1.05rem' }}>
              {sub.title}
            </span>
            <span 
              className="badge bg-secondary rounded-pill" 
              style={{ padding: '8px 14px', fontSize: '0.85rem', fontWeight: '500' }}
            >
              Order: {sub.order}
            </span>
          </div>
        ))}
    </div>
  ) : (
    !create && (
      <p className="text-muted text-center" style={{ marginTop: '20px' }}>
        No subjects available. Add one to get started!
      </p>
    )
  )}
</div>

    </div>
  );

}