import React from "react";
import {Alert, Button, Form} from 'react-bootstrap';
import { useNavigate } from "react-router-dom";
export default function Signup({setUsers}){
    const [newUser,setNewUser]=React.useState({
        email:"",
        name:"",
        password:""
    });
     const navigate = useNavigate();
    const [isSignUp,setIsSignUp]=React.useState(false);
    const [alertMessage,setAlertMessage]=React.useState({
        type:"",text:""
    });
    function postHandler(use){
        const {name,value}=use.target;
        setNewUser(prev=>({
            ...prev,[name]:value
        }))
    };

    async function handleNewUser(use){
        use.preventDefault();

        if (!newUser.name || !newUser.email || !newUser.password){
            setAlertMessage({type:"danger",
                text:"Email, Name and Password are required to sign In"
            });
            return;

        }
        setIsSignUp(true);
        try{
            const payload={
                name:newUser.name,
                email: newUser.email,
                password: newUser.password
            };
            const response=await fetch("http://localhost:5000/api/signup",{
                method:"POST",
                headers:{"content-Type":"application/json"},
                body:JSON.stringify(payload)
            });
            const data=await response.json();
            console.log("User created successfully");
            const newestUser=data.user || data;
            setNewUser({
                name:"",email:"",password:""
            });
            setAlertMessage({type:"success",text:"You have successfully signed in. Now Log In to access"});
        }catch(error){
            setAlertMessage({type:"danger",text:"Request failed. Please try again"})
        }finally{
            setIsSignUp(false)
        }
    }
       return (
    <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '85vh', 
        padding: '20px',
        backgroundColor: '#f8fafc' 
    }}>
        <div style={{ 
            width: '100%', 
            maxWidth: '480px', 
            backgroundColor: '#ffffff', 
            padding: '40px', 
            borderRadius: '20px', 
            boxShadow: '0 15px 35px rgba(0, 0, 0, 0.06)', 
            border: '1px solid #e2e8f0' 
        }}>
          
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h2 style={{ fontWeight: '800', color: '#1e293b', fontSize: '2.1rem', marginBottom: '10px' }}>
                    Create Account
                </h2>
                <p style={{ color: '#64748b', fontSize: '14px', fontWeight: '500', lineHeight: '1.5' }}>
                    Join the LMS platform today to manage and explore your learning paths
                </p>
            </div>

            <Form onSubmit={handleNewUser}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginBottom: '20px', width: '100%' }}>
                    <Form.Label style={{ fontWeight: '700', color: '#475569', fontSize: '14px', marginBottom: '8px' }}>
                        Full Name
                    </Form.Label>
                    <Form.Control 
                        type="text" 
                        name="name"
                        placeholder="Give your full name"
                        value={newUser.name} 
                        onChange={postHandler}
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

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginBottom: '20px', width: '100%' }}>
                    <Form.Label style={{ fontWeight: '700', color: '#475569', fontSize: '14px', marginBottom: '8px' }}>
                        Email Address
                    </Form.Label>
                    <Form.Control 
                        type="email" 
                        name="email"
                        placeholder="Give your emailID"
                        value={newUser.email} 
                        onChange={postHandler}
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
                        Password
                    </Form.Label>
                    <Form.Control 
                        type="password" 
                        name="password"
                        placeholder="Minimum 8 characters length"
                        value={newUser.password} 
                        onChange={postHandler} 
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

       
                <Button 
                    variant="success" 
                    type="submit" 
                    disabled={isSignUp}
                    style={{ 
                        height: '50px', 
                        fontSize: '16px', 
                        fontWeight: '700', 
                        borderRadius: '10px',
                        width: '100%',
                        backgroundColor: '#198754',
                        border: 'none',
                        boxShadow: '0 4px 12px rgba(25, 135, 84, 0.2)',
                        marginBottom: '28px'
                    }}
                >
                    {isSignUp ? "Signing Up..." : "Sign Up"}
                </Button>
            </Form>
            <div style={{ 
                textAlign: 'center', 
                borderTop: '1px solid #f1f5f9', 
                paddingTop: '20px',
                fontSize: '14px',
                color: '#64748b',
                fontWeight: '500'
            }}>
                Already have an account?{' '}
                <span 
                    onClick={() => navigate("/login")} 
                    style={{ 
                        color: '#0d6efd', 
                        textDecoration: 'none', 
                        cursor: 'pointer',
                        fontWeight: '700',
                        marginLeft: '4px'
                    }}
                    onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                    onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                >
                    Log In
                </span>
            </div>
        </div>
        

        {alertMessage.text && (
            <div style={{ width: '100%', maxWidth: '480px', marginTop: '20px', textAlign: 'left' }}>
                <Alert 
                    variant={alertMessage.type}
                    onClose={() => setAlertMessage({ type: "", text: "" })} 
                    dismissible
                    style={{ borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}
                >
                    {alertMessage.text}
                </Alert>
            </div>
        )}
    </div>
);

    
}