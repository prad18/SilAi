import React, { useState } from 'react';
import Chat from './Chat';
import './Leader.css';

const Leader = ({ leader }) => {
    const [showChat, setShowChat] = useState(false);

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
                    onClick={() => setShowChat(!showChat)}
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