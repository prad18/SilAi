import React from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { connect } from "react-redux";
import { login } from "../reducer/Actions";
import "../css/login.css"; 

const Login = ({ login, isAuthenticated }) => {
    const location = useLocation();
    const [ formData, setFormData ] = useState ({
        email: "",
        password: ""
    });
    const [ error, setError ] = useState(null);
    const [ successMessage, setSuccessMessage ] = useState(null);
    
    // Check for URL parameters on component mount
    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const verified = urlParams.get('verified');
        const error = urlParams.get('error');
        const message = urlParams.get('message');
        
        if (verified === 'true') {
            setSuccessMessage(message || 'Email verified successfully! You can now login.');
            setError(null);
        } else if (error) {
            let errorMessage = 'Email verification failed.';
            switch (error) {
                case 'invalid_key':
                    errorMessage = 'Invalid verification link. Please try again or request a new verification email.';
                    break;
                case 'confirmation_failed':
                    errorMessage = 'Email confirmation failed. Please try again.';
                    break;
                default:
                    errorMessage = 'Email verification failed. Please try again.';
            }
            setError(errorMessage);
            setSuccessMessage(null);
        }
    }, [location.search]);
    
    const { email, password } = formData;
    const handlingInput = (e) => setFormData({...formData, [e.target.name]: e.target.value});
    const handlingSubmit = async (e) => {
        e.preventDefault();
        setError(null); // Clear previous errors
        
        try {
            await login(email, password);
            // Login successful - user will be redirected by the Navigate component
        } catch (err) {
            // Handle login errors
            if (err.response && err.response.data && err.response.data.detail) {
                setError(err.response.data.detail);
            } else if (err.response && err.response.data && err.response.data.non_field_errors) {
                setError(err.response.data.non_field_errors[0]);
            } else {
                setError("An error occurred. Please try again.");
            }
        }
    }
    const reachGoogle = () => {
        const clientID = `${process.env.REACT_APP_CLIENT_ID}`;
        const callBackURI = "http://localhost:3000/";
        window.location.replace(`https://accounts.google.com/o/oauth2/v2/auth?redirect_uri=${callBackURI}&prompt=consent&response_type=code&client_id=${clientID}&scope=openid%20email%20profile&access_type=offline`)
    }
    if (isAuthenticated) {
        return <Navigate to={"../"}></Navigate>
    }
    return (
        <div className="auth-page-container">
        <h1 className="main-title">SilAI</h1>
  
        <div className="login-container">
          <div className="login-card">
            <form className="login-form" onSubmit={handlingSubmit}>
              <div className="form-group">
                <label>Login</label>
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={handlingInput}
                  placeholder="Email"
                  className="form-control"
                />
              </div>
  
              <div className="form-group">
                <input
                  type="password"
                  name="password"
                  value={password}
                  onChange={handlingInput}
                  placeholder="Password"
                  className="form-control"
                />
              </div>
  
              <button className="login-button" type="submit">LOGIN</button>
            </form>

            {error && <div className="error-message">{error}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}

            <div className="divider">or</div>

            <button className="google-button" type="button" onClick={reachGoogle}>
            <img src="/google.svg" alt="Google" className="google-icon" />
            <span>Sign in with Google</span>
            </button>
            <p className="forgot-password">
              Forgot your password? <Link to="../reset-password/">Reset Password</Link>
            </p>
            <p className="signup-link">
              Don't have an account? <Link to="../signup/">Signup</Link>
            </p>
          </div>
        </div>
      </div>
    )
}

const mapStateToProps = ( state ) => {
    return {
        isAuthenticated: state.AuthReducer.isAuthenticated
    }
}

export default connect(mapStateToProps, { login })(Login)