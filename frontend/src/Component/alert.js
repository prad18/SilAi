import React, { useEffect } from "react";
import { useState } from "react";
import { connect } from "react-redux";
import { closeAlert } from "../reducer/Actions";
import "./alert.css";

const Alert = (props) => {
    const [classAlert, setClassAlert] = useState("alert");
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Auto-dismiss after 5 seconds
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(() => {
                props.closeAlert();
            }, 300); // Wait for fade out animation
        }, 5000);

        return () => clearTimeout(timer);
    }, [props.closeAlert]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => {
            props.closeAlert();
        }, 300); // Wait for fade out animation
    };

    return (
        <div className={`alert-container ${isVisible ? 'show' : 'hide'}`}>
            <div className={`alert ${props.type || 'info'}`}>
                <div className="alert-content">
                    <div className="alert-message">{props.message}</div>
                    <button className="alert-close" onClick={handleClose}>
                        <span>&times;</span>
                    </button>
                </div>
                <div className="alert-progress"></div>
            </div>
        </div>
    );
};

export default connect(null, { closeAlert })(Alert);