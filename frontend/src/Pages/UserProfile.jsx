import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import "../css/Profile.css"; // Ensure correct CSS path

const UserProfile = () => {
  const navigate = useNavigate();
  const { access } = useSelector((state) => state.AuthReducer);
  
  const [profileData, setProfileData] = useState({
    first_name: "",
    last_name: "",
    profile_image: null,
  });

  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/accounts/profile/`, {
      headers: { Authorization: `Bearer ${access}` },
    })
    .then((response) => {
      setProfileData(response.data);
      if (response.data.profile_image) {
        setPreviewImage(`${process.env.REACT_APP_API_URL}${response.data.profile_image}`);
      }
    })
    .catch((error) => {
      console.error("Error fetching profile:", error);
      if (error.response?.status === 401) {
        navigate("/login");
      }
    });
  }, [access, navigate]);

  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setProfileData({ ...profileData, profile_image: file });

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const formData = new FormData();
    formData.append("first_name", profileData.first_name);
    formData.append("last_name", profileData.last_name);
    if (profileData.profile_image) {
      formData.append("profile_image", profileData.profile_image);
    }
  
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/accounts/profile/`,
        formData,
        {
          headers: {
            "Authorization": `Bearer ${access}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
  
      
  
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Profile update failed!");
    }
  };

  return (
    <div className="profile-container">
      <h2>User Profile</h2>

      <form onSubmit={handleSubmit} className="profile-form">
        {/* Profile Image Upload */}
        <label htmlFor="profileImage" className="profile-image-label">
          {previewImage ? (
            <img src={previewImage} alt="" className="profile-image-preview" />
          ) : (
            <span>Upload Image</span>
          )}
        </label>
        <input
          type="file"
          id="profileImage"
          name="profile_image"
          accept="image/*"
          onChange={handleImageChange}
        />

        {/* First Name Input */}
        <input
          type="text"
          name="first_name"
          value={profileData.first_name}
          onChange={handleChange}
          placeholder="First Name"
        />

        {/* Last Name Input */}
        <input
          type="text"
          name="last_name"
          value={profileData.last_name}
          onChange={handleChange}
          placeholder="Last Name"
        />

        {/* Submit Button */}
        <button type="submit">Update Profile</button>
      </form>
    </div>
  );
};



export default UserProfile;
