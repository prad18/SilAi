import React from "react";
import { Link, Navigate } from "react-router-dom";
import { useState } from "react";
import { connect } from "react-redux";
import { login } from "../reducer/Actions";
import "../css/main.css"; 

const Login = ({ login, isAuthenticated }) => {
    const [ formData, setFormData ] = useState ({
        email: "",
        password: ""
    });
    const { email, password } = formData;
    const handlingInput = (e) => setFormData({...formData, [e.target.name]: e.target.value});
    const handlingSubmit = (e) => {
        e.preventDefault();
        login( email, password );
    }
    const reachGoogle = () => {
        const clientID = "949511854956-g8hp12tv3jjbndj5qo951tvebhf6fken.apps.googleusercontent.com";
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