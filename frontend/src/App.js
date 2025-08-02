import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Provider } from "react-redux";

// Components
import PrivateRoute from "./Component/PrivateRoute";
import PublicRoute from "./Component/PublicRoute";
import Layout from "./hocs/Layout";

// Pages
import Home from "./Pages/Home";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import ChangePassword from "./Pages/ChangePassword";
import ResetPassword from "./Pages/ResetPassword";
import ResetPasswordConfirm from "./Pages/ResetPasswordConfirm";
import EmailVerification from "./Pages/EmailVerification";
import UserProfile from "./Pages/UserProfile";
import ChatPage from "./Pages/ChatPage";

// Store
import Store from "./Store";

const App = () => {
  return (
    <Provider store={Store}>
      <Router>
        <Layout>
          <Routes>
            {/* Public Routes - Redirect to home if authenticated */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <PublicRoute>
                  <Signup />
                </PublicRoute>
              }
            />
            <Route
              path="/reset-password"
              element={
                <PublicRoute>
                  <ResetPassword />
                </PublicRoute>
              }
            />
            <Route
              path="/dj-rest-auth/registration/account-confirm-email/:key"
              element={
                <PublicRoute>
                  <EmailVerification />
                </PublicRoute>
              }
            />
            <Route
              path="/reset/password/confirm/:uid/:token"
              element={
                <PublicRoute>
                  <ResetPasswordConfirm />
                </PublicRoute>
              }
            />

            {/* Protected Routes - Require authentication */}
            <Route
              path="/home"
              element={
                <PrivateRoute>
                  <Home />
                </PrivateRoute>
              }
            />
            <Route
              path="/change-password"
              element={
                <PrivateRoute>
                  <ChangePassword />
                </PrivateRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <UserProfile />
                </PrivateRoute>
              }
            />

            <Route
              path="/chat/:leaderId"
              element={
                <PrivateRoute>
                  <ChatPage />
                </PrivateRoute>
              }
            />

            {/* Redirect root to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Catch all other routes and redirect to home */}
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </Layout>
      </Router>
    </Provider>
  );
};

export default App;
