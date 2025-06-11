import React, { useState, useEffect } from 'react';
import Chat from './Chat';
import './Leader.css';

const Leader = ({ leader }) => {
    const [showChat, setShowChat] = useState(false);

    useEffect(() => {
        console.log('Leader component mounted with leader:', leader);
    }, [leader]);

    const handleChatClick = () => {
        console.log('Chat button clicked, current showChat:', showChat);
        setShowChat(!showChat);
    };

    return (
        <div className="leader-card">
            <div className="leader-image">
                {leader.image && <img src={leader.image} alt={leader.name} />}
            </div>
            <div className="leader-info">
                <h3>{leader.name}</h3>
                <p>{leader.bio}</p>
                <button 
                    className="chat-button"
                    onClick={handleChatClick}
                >
                    {showChat ? 'Close Chat' : 'Chat with Leader'}
                </button>
            </div>
            {showChat && (
                <div className="chat-wrapper">
                    <Chat leader={leader} />
                </div>
            )}
        </div>
    );
};

export default Leader; 