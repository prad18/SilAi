import React from "react";
import { Link, Navigate } from "react-router-dom";
import { useState } from "react";
import { connect } from "react-redux";
import { login } from "../reducer/Actions";
import "../css/login.css"; 

const Login = ({ login, isAuthenticated }) => {
    const [ formData, setFormData ] = useState ({
        email: "",
        password: ""
    });
    const [ error, setError ] = useState(null);
    const { email, password } = formData;
    const handlingInput = (e) => setFormData({...formData, [e.target.name]: e.target.value});
    const handlingSubmit = (e) => {
        e.preventDefault();
        login( email, password ).catch(err => {
          if (err.response && err.response.data && err.response.data.detail) {
              setError(err.response.data.detail);
          } else {
              setError("An error occurred. Please try again.");
          }
      });
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
        <div className="page-container">
        <h1 className="main-title">SilAI</h1>
  
        <div className="login-container">
          <div className="login-card">

            {error && <div className="error-message">{error}</div>}  
            <button className="google-button" type="button" onClick={reachGoogle}>
            <img src="/google.svg" alt="Google" className="google-icon" />
            <span>Sign in with Google</span>
            </button>
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