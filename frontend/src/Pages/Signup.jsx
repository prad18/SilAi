import React from "react";
import { Link } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { useState } from "react";
import { connect } from "react-redux";
import { signup } from "../reducer/Actions";

const Signup = ({ signup }) => {
    const [ status, setStatus ] = useState (false);
    const [ formData, setFormData ] = useState ({
        email: "",
        first_name: "",
        last_name: "",
        password1: "",
        password2: ""
    });
    const { email, first_name, last_name, password1, password2 } = formData;
    const handlingInput = (e) => setFormData({...formData, [e.target.name]: e.target.value});
    const handlingSubmit = (e) => {
        e.preventDefault();
        signup( email, first_name, last_name, password1, password2 );
        setStatus(true)
    }
    if (status) {
        return <Navigate to={"../"}></Navigate>
    }
    return (
        <div className="page-container">
        <h1 className="main-title">SilAI</h1>

        <div className="login-container">
            <div className="login-card">
            <h2 className="text-center">Signup</h2>

            <form className="login-form" onSubmit={handlingSubmit}>
                <div className="form-group">
                <label>First Name</label>
                <input
                    type="text"
                    name="first_name"
                    value={first_name}
                    onChange={handlingInput}
                    placeholder="First name ..."
                    className="form-control"
                />
                </div>

                <div className="form-group">
                <label>Last Name</label>
                <input
                    type="text"
                    name="last_name"
                    value={last_name}
                    onChange={handlingInput}
                    placeholder="Last name ..."
                    className="form-control"
                />
                </div>

                <div className="form-group">
                <label>Email address</label>
                <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={handlingInput}
                    placeholder="name@example.com"
                    className="form-control"
                />
                </div>

                <div className="form-group">
                <label>Password</label>
                <input
                    type="password"
                    name="password1"
                    value={password1}
                    onChange={handlingInput}
                    placeholder="Password ..."
                    className="form-control"
                />
                </div>

                <div className="form-group">
                <label>Re-enter Password</label>
                <input
                    type="password"
                    name="password2"
                    value={password2}
                    onChange={handlingInput}
                    placeholder="Password ..."
                    className="form-control"
                />
                </div>

                <button className="login-button" type="submit">Signup</button>
            </form>

            <p className="signup-link">
                Already have an account? <Link to="../login/">Login</Link>
            </p>
            </div>
        </div>
        </div>
    )
}

export default connect(null, { signup })(Signup)