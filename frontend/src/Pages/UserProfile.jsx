import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import "../css/Profile.css";

const UserProfile = () => {
  const navigate = useNavigate();
  const { access, user } = useSelector((state) => state.AuthReducer);
  
  const [profileData, setProfileData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    profile_image: null,
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    if (!access) {
      navigate("/login");
      return;
    }

    fetchProfileData();
  }, [access, navigate]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/accounts/profile/`,
        {
          headers: { Authorization: `Bearer ${access}` },
        }
      );
      
      setProfileData({
        first_name: response.data.first_name || "",
        last_name: response.data.last_name || "",
        email: response.data.email || "",
        profile_image: null,
      });
      
      if (response.data.profile_image) {
        setPreviewImage(`${process.env.REACT_APP_API_URL}${response.data.profile_image}`);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError("Failed to load profile data");
      if (error.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleImageChange = (file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError("Please select an image file");
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB");
      return;
    }

    setProfileData({ ...profileData, profile_image: file });

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(file);
    setError(null);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    handleImageChange(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    handleImageChange(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!profileData.first_name.trim() || !profileData.last_name.trim()) {
      setError("First name and last name are required");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess("");

    const formData = new FormData();
    formData.append("first_name", profileData.first_name.trim());
    formData.append("last_name", profileData.last_name.trim());
    
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

      setSuccess("Profile updated successfully!");
      // Reset the profile_image in state since it's now saved
      setProfileData(prev => ({ ...prev, profile_image: null }));
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
      
    } catch (error) {
      console.error("Error updating profile:", error);
      setError(error.response?.data?.detail || "Profile update failed!");
    } finally {
      setSaving(false);
    }
  };

  const removeImage = () => {
    setPreviewImage(null);
    setProfileData({ ...profileData, profile_image: null });
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="profile-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      
      
      <div className="profile-container">
        <div className="profile-card">
          <h2 className="profile-title">My Profile</h2>
          
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <form onSubmit={handleSubmit} className="profile-form">
            {/* Profile Image Section */}
            <div className="profile-image-section">
              <div 
                className={`profile-image-upload ${isDragOver ? 'drag-over' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {previewImage ? (
                  <div className="image-preview-container">
                    <img src={previewImage} alt="Profile Preview" className="profile-image-preview" />
                    <div className="image-overlay">
                      <button 
                        type="button" 
                        className="remove-image-btn"
                        onClick={removeImage}
                        title="Remove image"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="upload-placeholder">
                    <div className="upload-icon">📷</div>
                    <p>Drop image here or click to upload</p>
                    <span className="upload-hint">PNG, JPG up to 5MB</span>
                  </div>
                )}
                
                <input
                  type="file"
                  id="profileImage"
                  name="profile_image"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="file-input"
                />
              </div>
            </div>

            {/* Form Fields */}
            <div className="form-fields">
              <div className="form-group">
                <label htmlFor="first_name">First Name</label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={profileData.first_name}
                  onChange={handleChange}
                  placeholder="Enter your first name"
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="last_name">Last Name</label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={profileData.last_name}
                  onChange={handleChange}
                  placeholder="Enter your last name"
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={profileData.email}
                  disabled
                  className="form-input disabled"
                  title="Email cannot be changed"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="form-actions">
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => navigate('/home')}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="btn-spinner"></span>
                    Saving...
                  </>
                ) : (
                  'Update Profile'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
