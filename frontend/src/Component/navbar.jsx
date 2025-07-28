import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { connect } from "react-redux";
import { logout } from "../reducer/Actions";
import "../css/Navbar.css"; // Assuming you have a CSS file for styling

const Navbar = ({ user,logout }) => {
    const { access, isAuthenticated } = useSelector((state) => state.AuthReducer);
    const navigate = useNavigate();
    const [userProfileImage, setUserProfileImage] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);


    useEffect(() => {
        const fetchData = async () => {
        try {
            const config = {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${access}`,
            },
            };

            const [profileResponse] = await Promise.all([
            axios.get(`${process.env.REACT_APP_API_URL}/accounts/profile/`, config),
            ]);

            // Set profile image
            if (profileResponse.data.profile_image) {
            setUserProfileImage(`${process.env.REACT_APP_API_URL}${profileResponse.data.profile_image}`);
            } else {
            setUserProfileImage(null);
            }


        } catch (error) {
            console.error("Error fetching data:", error);
            if (error.response && error.response.status === 401) {
            navigate("/login");
            }
        }
        };

        fetchData();
    }, [access, isAuthenticated, navigate]);


  // Close dropdown when clicking outside
  useEffect(() => {
    if (user?.profile_image) {
      setUserProfileImage(`${process.env.REACT_APP_API_URL}${user.profile_image}`);
    } else {
      setUserProfileImage(null);
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

    const handleTitleClick = () => {
        navigate("/home"); // or "/" depending on your routing setup
    };
    const handleUserLogoClick = () => {
    setShowDropdown((prev) => !prev);
  };
    const handleMyAccount = () => {
    setShowDropdown(false);
    navigate("/profile");
  };

  const handleChangePassword = () => {
    setShowDropdown(false);
    navigate("/change-password");
  };

  const handleLogout = () => {
    setShowDropdown(false);
    logout();
    navigate("/login");
  };
    return (
      <div className="navbar">
        <h2 className="navbar-title clickable-title" onClick={handleTitleClick}>SilAI</h2>

        <div className="user-logo-wrapper" ref={dropdownRef} style={{ position: "relative" }}>
          <img
            src={userProfileImage || "./user.svg"} 
            alt="User Logo"
            className="user-logo"
            onClick={handleUserLogoClick}
            style={{ cursor: "pointer" }}
          />
          {showDropdown && (
            <div className="profile-dropdown">
              <button onClick={handleMyAccount}>My Account</button>
              <button onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      </div>
    )
}

const mapStateToProps = ( state ) => {
    return {
        isAuthenticated: state.AuthReducer.isAuthenticated
    }
}

export default connect(mapStateToProps, { logout })(Navbar)