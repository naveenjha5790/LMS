import React from "react";
import { Alert, Button, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom"; // IMPORTED: Required for component redirection hooks

export default function Login({ setUsers }) {
    const [alertMessage, setAlertMessage] = React.useState({
        type: "",
        text: ""
    });
    const [newLogin, setNewLogin] = React.useState({
        email: "",
        password: ""
    });
    const [isLogin, setIsLogin] = React.useState(false);
    const navigate = useNavigate(); 

    function postHandler(use) {
        const { name, value } = use.target;
        setNewLogin(prev => ({
            ...prev,
            [name]: value
        }));
    }

    async function doLogin(use) {
        use.preventDefault();
        if (!newLogin.email || !newLogin.password) {
            setAlertMessage({
                type: "danger",
                text: "Please provide email and password"
            });
            return;
        }
        setIsLogin(true);
        setAlertMessage({ type: "", text: "" });

        try {
            const payload = {
                email: newLogin.email,
                password: newLogin.password
            };
            const response = await fetch("http://localhost:5000/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.msg || data.message || "Invalid Credentials");
            }

        
            if (data.token) {
                localStorage.setItem("token", data.token);
                
                try {
                    const tokenParts = data.token.split('.');
                    if (tokenParts.length === 3) {
                        const base64Url = tokenParts[1];
                        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                        const decodedUser = JSON.parse(window.atob(base64));
                        
                        setUsers({
                            id: decodedUser.id || decodedUser.sub || data.user?.id || "",
                            email: decodedUser.email || data.user?.email || newLogin.email,
                            role: decodedUser.role || data.user?.role || "LMS_MANAGER" 
                        });
                    }
                } catch (decodeError) {
                    console.warn("Could not parse explicit token properties structure payload, fallback to data mapping profile:", decodeError);
                    const backendUser = data.user || data;
                    setUsers({
                        id: backendUser.id || backendUser._id,
                        email: backendUser.email || newLogin.email,
                        role: backendUser.role || "LMS_MANAGER"
                    });
                }
            } else {
                const backendUser = data.user || data;
                setUsers({
                    id: backendUser.id || backendUser._id,
                    email: backendUser.email || newLogin.email,
                    role: backendUser.role || "LMS_MANAGER"
                });
            }

            setNewLogin({
                email: "",
                password: ""
            });

            setAlertMessage({
                type: "success",
                text: "Successfully logged in"
            });

            navigate("/getPaths");
    <div style={{ 
                textAlign: 'center', 
                borderTop: '1px solid #f1f5f9', 
                paddingTop: '20px',
                fontSize: '15px',
                color: '#64748b',
                fontWeight: '500'
            }}>
                First time using LMS?{' '}
                <span 
                    onClick={() => navigate("/signup")} 
                    style={{ 
                        color: '#0d6efd', 
                        textDecoration: 'underline', 
                        cursor: 'pointer',
                        fontWeight: '700'
                    }}
                >
                    Create an Account
                </span>
            </div>
        
        } catch (error) {
            setAlertMessage({
                type: "danger",
                text: error.message || "Something went wrong"
            });
        } finally {
            setIsLogin(false);
        }
    }

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
        
        <div style={{ 
            width: '100%', 
            maxWidth: '480px', 
            backgroundColor: '#ffffff', 
            padding: '40px', 
            borderRadius: '20px', 
            boxShadow: '0 15px 35px rgba(0, 0, 0, 0.06)', 
            border: '1px solid #e2e8f0' 
        }}>
        
            <div style={{ textAlign: 'center', marginBottom: '36px' }}>
                <h2 style={{ fontWeight: '800', color: '#1e293b', fontSize: '2.1rem', marginBottom: '10px' }}>
                    Welcome Back
                </h2>
                <p style={{ color: '#64748b', fontSize: '14px', fontWeight: '500', lineHeight: '1.5' }}>
                    Please enter your credentials to access your workspace
                </p>
            </div>

            <Form onSubmit={doLogin}>
            
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginBottom: '20px', width: '100%' }}>
                    <Form.Label style={{ fontWeight: '700', color: '#475569', fontSize: '14px', marginBottom: '8px' }}>
                        Email Address
                    </Form.Label>
                    <Form.Control 
                        type="email"
                        name="email" 
                        placeholder="Give your registered email id"
                        value={newLogin.email} 
                        onChange={postHandler}
                        required
                        disabled={isLogin}
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
                        placeholder="Give your password"
                        value={newLogin.password} 
                        onChange={postHandler}
                        required
                        disabled={isLogin}
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
                    disabled={isLogin}
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
                    {isLogin ? "Logging In..." : "Log In"}
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
                First time using LMS?{' '}
                <span 
                    onClick={() => navigate("/signup")} 
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
                    Create an Account
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
