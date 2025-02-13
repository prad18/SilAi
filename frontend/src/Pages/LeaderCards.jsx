import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const LeaderCards = () => {
  // Access the token and authentication status from your Redux state
  const { access, isAuthenticated } = useSelector((state) => state.AuthReducer);
  const [leaders, setLeaders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // If the user isn't authenticated or we don't have a token, redirect to login
    if (!isAuthenticated || !access) {
      navigate("/login");
      return;
    }

    const fetchLeaders = async () => {
      try {
        const config = {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${access}`,
          },
        };

        const response = await axios.get("http://localhost:8000/api/leaders/", config);
        setLeaders(response.data);
      } catch (error) {
        console.error("Error fetching leaders:", error);
        // Optionally handle unauthorized errors by redirecting to login
        if (error.response && error.response.status === 401) {
          navigate("/login");
        }
      }
    };

    fetchLeaders();
  }, [access, isAuthenticated, navigate]);

  return (
    <div className="leader-cards">
      {leaders.map((leader) => (
        <div key={leader.id} className="card">
          <h2>{leader.name}</h2>
          <h4>{leader.position}</h4>
          <p>{leader.bio}</p>
          {leader.image && <img src={leader.image} alt={leader.name} />}
        </div>
      ))}
    </div>
  );
};

export default LeaderCards;
