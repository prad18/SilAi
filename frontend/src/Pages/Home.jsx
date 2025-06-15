import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { connect, useSelector } from "react-redux";
import Leader from "../Component/Leader"; // Import Leader component
import "../css/Mainpage.css";

const Home = ({ user }) => {
  const { access, isAuthenticated } = useSelector((state) => state.AuthReducer);
  const navigate = useNavigate();
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch leader data
  useEffect(() => {
    if (!isAuthenticated || !access) {
      navigate("/login");
      return;
    }

    const fetchLeaders = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const config = {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${access}`,
          },
        };

        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/leaders/`,
          config
        );
        
        setLeaders(response.data || []);
        
      } catch (error) {
        console.error("Error fetching leaders:", error);
        setError(`Failed to load leaders: ${error.response?.data?.detail || error.message}`);
        
        if (error.response && error.response.status === 401) {
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLeaders();
  }, [access, isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="page-container">
        <h1 className="greet">Loading...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <h1 className="greet">Error: {error}</h1>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 className="greet">Hello, {user?.first_name || "User"}</h1>

      <div className="list">
        <h4 className="l-header">People</h4>
        <div className="scroll-container">
          {leaders.length > 0 ? (
            leaders.map((leader) => (
              <Leader key={leader.id} leader={leader} />
            ))
          ) : (
            <div className="no-leaders">
              <p>No leaders found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => ({
  user: state.AuthReducer.user,
});

export default connect(mapStateToProps)(Home);