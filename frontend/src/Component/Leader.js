import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "../css/Leader.css"; 

const Leader = ({ leader }) => {
    const navigate = useNavigate();
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        console.log('Leader component mounted with leader:', leader);
        console.log('Leader image path:', leader.image);
        console.log('Full image URL:', leader.image ? `${process.env.REACT_APP_API_URL}${leader.image}` : 'No image');
    }, [leader]);

    const handleChatClick = () => {
        console.log('Chat button clicked, navigating to chat page for leader:', leader.id);
        navigate(`/chat/${leader.id}`);
    };

    const handleImageError = (e) => {
        console.log('Image failed to load:', e.target.src);
        setImageError(true);
        e.target.src = "./default-leader.svg";
    };

    const getImageSrc = () => {
        if (imageError) {
            return "./default-leader.svg";
        }
        
        if (leader.image) {
            // Check if the image path already includes the full URL
            if (leader.image.startsWith('http')) {
                return leader.image;
            }
            // If it starts with /, it's already a full path from root
            if (leader.image.startsWith('/')) {
                return `${process.env.REACT_APP_API_URL}${leader.image}`;
            }
            // If it doesn't start with /, add /media/ prefix
            return `${process.env.REACT_APP_API_URL}/media/${leader.image}`;
        }
        
        return "./default-leader.svg";
    };

    return (
        <div key={leader.id} className="person-box">
            <img
              src={getImageSrc()}
              alt={leader.name}
              className="person-image"
              onError={handleImageError}
              onLoad={() => console.log('Image loaded successfully:', getImageSrc())}
            />
            <p className="person-name">{leader.name}</p>
            <button 
              className="chat-button"
              onClick={handleChatClick}
            >
              Chat
            </button>
        </div>
    );
};

export default Leader;