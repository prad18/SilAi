import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import './Chat.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const Chat = ({ leader }) => {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [sessionId, setSessionId] = useState(uuidv4());
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        console.log('Chat component mounted with leader:', leader);
        console.log('API Base URL:', API_BASE_URL);
    }, [leader]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputMessage.trim()) return;

        const userMessage = inputMessage;
        setInputMessage('');
        setMessages(prev => [...prev, { type: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const url = `${API_BASE_URL}/api/leaders/${leader.id}/chat/`;
            console.log('Sending message to:', url);
            console.log('Message data:', { message: userMessage, session_id: sessionId });
            console.log('Auth token:', localStorage.getItem('access'));
            
            const response = await axios.post(url, {
                message: userMessage,
                session_id: sessionId
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('access')}`
                },
                withCredentials: true
            });

            console.log('Response received:', response.data);
            setMessages(prev => [...prev, { type: 'ai', content: response.data.response }]);
        } catch (error) {
            console.error('Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                headers: error.response?.headers
            });
            setMessages(prev => [...prev, { 
                type: 'error', 
                content: `Error: ${error.response?.data?.error || error.message || 'Unknown error occurred'}`
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClearChat = () => {
        console.log('Clearing chat');
        setMessages([]);
        setSessionId(uuidv4());
    };

    // Add initial message when chat is opened
    useEffect(() => {
        if (leader) {
            console.log('Setting initial message for leader:', leader.name);
            setMessages([{
                type: 'ai',
                content: `Hello! I'm ${leader.name}. How can I help you today?`
            }]);
        }
    }, [leader]);

    return (
        <div className="chat-container">
            <div className="chat-header">
                <h3>Chat with {leader.name}</h3>
                <button onClick={handleClearChat} className="clear-button">
                    Clear Chat
                </button>
            </div>
            
            <div className="messages-container">
                {messages.map((message, index) => (
                    <div key={index} className={`message ${message.type}`}>
                        <div className="message-content">
                            {message.content}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="message ai">
                        <div className="message-content">
                            <div className="typing-indicator">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="input-container">
                <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Type your message..."
                    disabled={isLoading}
                />
                <button type="submit" disabled={isLoading || !inputMessage.trim()}>
                    Send
                </button>
            </form>
        </div>
    );
};

export default Chat; 