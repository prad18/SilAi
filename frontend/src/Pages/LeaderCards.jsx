// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import { connect, useSelector } from "react-redux";
// import Chat from "../Component/Chat";
// import "../css/Mainpage.css"; // Ensure this path is correct

// const Home = ({ user }) => {
//   // Get token and auth status using useSelector
//   const { access, isAuthenticated } = useSelector((state) => state.AuthReducer);
//   const navigate = useNavigate();
//   const [leaders, setLeaders] = useState([]);
//   const [selectedLeader, setSelectedLeader] = useState(null);

//   // Fetch leader data using axios (with token authorization)
//   useEffect(() => {
//     if (!isAuthenticated || !access) {
//       navigate("/login");
//       return;
//     }

//     const fetchLeaders = async () => {
//       try {
//         const config = {
//           headers: {
//             "Content-Type": "application/json",
//             "Authorization": `Bearer ${access}`,
//           },
//         };

//         const response = await axios.get(
//           `${process.env.REACT_APP_API_URL}/api/leaders/`,
//           config
//         );
//         setLeaders(response.data);
//       } catch (error) {
//         console.error("Error fetching leaders:", error);
//         // Optionally redirect to login if unauthorized
//         if (error.response && error.response.status === 401) {
//           navigate("/login");
//         }
//       }
//     };

//     fetchLeaders();
//   }, [access, isAuthenticated, navigate]);

//   // Handle click on the user logo in the navbar
//   const handleUserLogoClick = () => {
//     navigate("/profile");
//   };

//   const handleChatClick = (leader) => {
//     setSelectedLeader(leader);
//   };

//   const handleCloseChat = () => {
//     setSelectedLeader(null);
//   };

//   return (
//     <div className="page-container">
//       {/* 🔹 Navbar */}
//       <div className="navbar">
//         <h2 className="navbar-title">SilAI</h2>
//         <img
//           src={user?.profilePicture || "./user.svg"}
//           alt="User Logo"
//           className="user-logo"
//           onClick={handleUserLogoClick}
//         />
//       </div>

//       {/* 🔹 Greeting */}
//       <h1 className="greet">Hello, {user?.first_name || "User"}</h1>

//       {/* 🔹 People Section (showing leader cards) */}
//       <div className="list">
//         <h4 className="l-header">People</h4>
//         <div className="scroll-container">
//           {leaders.length > 0 ? (
//             leaders.map((leader) => (
//               <div key={leader.id} className="person-box">
//                 <img
//                   src={leader.image || "./default-leader.svg"}
//                   alt={leader.name}
//                   className="person-image"
//                 />
//                 <p className="person-name">{leader.name}</p>
//                 <button 
//                   className="chat-button"
//                   onClick={() => handleChatClick(leader)}
//                 >
//                   Chat
//                 </button>
//               </div>
//             ))
//           ) : (
//             <p className="loading-text">Loading...</p>
//           )}
//         </div>
//       </div>

//       {/* 🔹 Symbolism Section (placeholder or add your data)
//       <div className="list">
//         <h4 className="l-header">Symbolism</h4>
//         <div className="scroll-container">
//           Replace below with your symbolism data mapping if available
//           <p className="loading-text">No symbolism data available</p>
//         </div>
//       </div> */}

//       {/* Chat Modal */}
//       {selectedLeader && (
//         <div className="chat-modal">
//           <div className="chat-modal-content">
//             <button className="close-button" onClick={handleCloseChat}>×</button>
//             <Chat leader={selectedLeader} />
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// const mapStateToProps = (state) => ({
//   user: state.AuthReducer.user, // User info from your Redux state
// });

// export default connect(mapStateToProps)(Home);




import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { connect, useSelector } from "react-redux";
import { logout } from "../reducer/Actions"; // Import logout
import Chat from "../Component/Chat";
import "../css/Mainpage.css";

const Home = ({ user, logout }) => {
  const { access, isAuthenticated } = useSelector((state) => state.AuthReducer);
  const navigate = useNavigate();
  const [leaders, setLeaders] = useState([]);
  const [selectedLeader, setSelectedLeader] = useState(null);
  const [userProfileImage, setUserProfileImage] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch both user profile and leaders data
  useEffect(() => {
    if (!isAuthenticated || !access) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const config = {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${access}`,
          },
        };

        // Fetch user profile and leaders concurrently
        const [profileResponse, leadersResponse] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/accounts/profile/`, config),
          axios.get(`${process.env.REACT_APP_API_URL}/api/leaders/`, config)
        ]);

        // Set profile image
        if (profileResponse.data.profile_image) {
          setUserProfileImage(`${process.env.REACT_APP_API_URL}${profileResponse.data.profile_image}`);
        } else {
          setUserProfileImage(null);
        }

        // Set leaders data
        setLeaders(leadersResponse.data);

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

  const handleChatClick = (leader) => {
    setSelectedLeader(leader);
  };

  const handleCloseChat = () => {
    setSelectedLeader(null);
  };

  return (
    <div className="page-container">
      {/* 🔹 Navbar */}
      <div className="navbar">
        <h2 className="navbar-title">SilAI</h2>
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
              <button onClick={handleChangePassword}>Change Password</button>
              <button onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      </div>

      {/* 🔹 Greeting */}
      <h1 className="greet">Hello, {user?.first_name || "User"}</h1>

      {/* 🔹 People Section (showing leader cards) */}
      <div className="list">
        <h4 className="l-header">People</h4>
        <div className="scroll-container">
          {leaders.length > 0 ? (
            leaders.map((leader) => (
              <div key={leader.id} className="person-box">
                <img
                  src={leader.image || "./default-leader.svg"}
                  alt={leader.name}
                  className="person-image"
                />
                <p className="person-name">{leader.name}</p>
                <button 
                  className="chat-button"
                  onClick={() => handleChatClick(leader)}
                >
                  Chat
                </button>
              </div>
            ))
          ) : (
            <p className="loading-text">Loading...</p>
          )}
        </div>
      </div>

      {/* Chat Modal */}
      {selectedLeader && (
        <div className="chat-modal">
          <div className="chat-modal-content">
            <button className="close-button" onClick={handleCloseChat}>×</button>
            <Chat leader={selectedLeader} />
          </div>
        </div>
      )}
    </div>
  );
};

const mapStateToProps = (state) => ({
  user: state.AuthReducer.user,
});

export default connect(mapStateToProps, { logout })(Home);