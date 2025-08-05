import React, { useEffect } from "react";
import { connect } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import queryString from "query-string";
import Navbar from "../Component/navbar";
import Alert from "../Component/alert";
import { verify, getUser, googleLogin } from "../reducer/Actions";

const Layout = (props) => {
    let location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const values = queryString.parse(location.search);
        const code = values.code;
        if (code) {
            props.googleLogin(code);
        } else if (!props.isAuthenticated && localStorage.getItem('access')) {
            // Only verify and get user if we have a token but aren't authenticated
            props.verify();
            props.getUser();
        }
    }, [location.search]); // Only depend on search params, not the full location

    // Redirect to home after successful Google authentication
    useEffect(() => {
        if (props.isAuthenticated && location.search.includes('code=')) {
            // Clear the URL parameters and redirect to home
            navigate('/home', { replace: true });
        }
    }, [props.isAuthenticated, location.search, navigate]);

    // Check if current route is ChatPage - hide navbar for chat pages
    const isChatPage = location.pathname.startsWith('/chat/');
    // Check if current route is landing page - hide navbar for unauthenticated users
    const isLandingPage = location.pathname === '/';

    return (
        <div>
            {props.isAuthenticated && !isChatPage && <Navbar />}
            {props.message ? <Alert message={props.message} /> : null}
            {props.children}
        </div>
    );
};

const mapStateToProps = (state) => ({
    message: state.AuthReducer.message,
    access: state.AuthReducer.access,
    refresh: state.AuthReducer.refresh,
    isAuthenticated: state.AuthReducer.isAuthenticated,
    user: state.AuthReducer.user
});

export default connect(mapStateToProps, { verify, getUser, googleLogin })(Layout);
