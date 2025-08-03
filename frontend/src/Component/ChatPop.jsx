import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import '../css/Chat.css';

const API_BASE_URL = process.env.REACT_APP_API_URL;

const ChatPop = ({ leader, onClose }) => {
    // State management
    const { access } = useSelector((state) => state.AuthReducer);
    const [sessionId, setSessionId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [imageError, setImageError] = useState(false);
    
    // Refs
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Helper function to get auth headers
    const getAuthHeader = () => ({
        'Authorization': `Bearer ${access}`,
        'Content-Type': 'application/json'
    });

    // Helper function to get image source with fallback
    const getImageSrc = (imagePath) => {
        if (!imagePath || imageError) return '/user.svg';
        if (imagePath.startsWith('http')) return imagePath;
        return `${API_BASE_URL}${imagePath}`;
    };

    // Auto-scroll to bottom of messages
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Set up session ID
    useEffect(() => {
        if (!leader?.id) return;
        
        const storedSessionId = localStorage.getItem(`chat_session_${leader.id}`);
        if (storedSessionId) {
            setSessionId(storedSessionId);
        } else {
            const newSessionId = uuidv4();
            localStorage.setItem(`chat_session_${leader.id}`, newSessionId);
            setSessionId(newSessionId);
        }
    }, [leader?.id]);

    // Load chat history
    useEffect(() => {
        const loadChatHistory = async () => {
            if (!sessionId || !access) return;

            try {
                const response = await axios.get(
                    `${API_BASE_URL}/api/chat-history/${sessionId}/`,
                    { headers: getAuthHeader() }
                );
                
                if (response.data && response.data.length > 0) {
                    const expandedMessages = [];
                    response.data.forEach(msg => {
                        expandedMessages.push({
                            id: msg.id,
                            text: msg.message,
                            sender: 'user',
                            timestamp: new Date(msg.created_at)
                        });
                        
                        if (msg.ai_response) {
                            expandedMessages.push({
                                id: `ai_${msg.id}`,
                                text: msg.ai_response,
                                sender: 'ai',
                                timestamp: new Date(msg.created_at)
                            });
                        }
                    });
                    
                    setMessages(expandedMessages);
                }
            } catch (error) {
                console.error('Error loading chat history:', error);
            }
        };

        loadChatHistory();
    }, [sessionId, access]);

    // Send message function
    const sendMessage = async () => {
        if (!inputMessage.trim() || isLoading || !sessionId) return;

        const userMessage = {
            id: Date.now(),
            text: inputMessage.trim(),
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);
        setIsTyping(true);

        try {
            const response = await axios.post(
                `${API_BASE_URL}/api/chat/`,
                {
                    message: userMessage.text,
                    leader_id: leader.id,
                    session_id: sessionId
                },
                { headers: getAuthHeader() }
            );

            if (response.data && response.data.response) {
                const aiMessage = {
                    id: Date.now() + 1,
                    text: response.data.response,
                    sender: 'ai',
                    timestamp: new Date()
                };

                setMessages(prev => [...prev, aiMessage]);
            }
        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage = {
                id: Date.now() + 1,
                text: 'Sorry, I encountered an error. Please try again.',
                sender: 'ai',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
            setIsTyping(false);
        }
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        sendMessage();
    };

    // Handle key press
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // Clear chat function
    const clearChat = async () => {
        if (!sessionId) return;
        
        try {
            await axios.delete(
                `${API_BASE_URL}/api/clear-chat/${sessionId}/`,
                { headers: getAuthHeader() }
            );
            setMessages([]);
        } catch (error) {
            console.error('Error clearing chat:', error);
        }
    };

    // Format timestamp
    const formatTime = (timestamp) => {
        return timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    // Handle modal backdrop click
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="chat-modal" onClick={handleBackdropClick}>
            <div className="chat-modal-content">
                {/* Header */}
                <div className="chat-header">
                    <div className="leader-info">
                        <img 
                            src={getImageSrc(leader.image)} 
                            alt={leader.name}
                            className="leader-avatar"
                            onError={() => setImageError(true)}
                            onLoad={() => setImageError(false)}
                        />
                        <div className="leader-details">
                            <h3>{leader.name}</h3>
                            <p className="leader-description">{leader.description}</p>
                        </div>
                    </div>
                    
                    <div className="chat-controls">
                        <button className="clear-chat-btn" onClick={clearChat} title="Clear Chat">
                            🗑️
                        </button>
                        <button className="close-chat-btn" onClick={onClose} title="Close">
                            ✕
                        </button>
                    </div>
                </div>

                {/* Messages Container */}
                <div className="chat-messages">
                    {messages.length === 0 ? (
                        <div className="empty-chat">
                            <div className="welcome-message">
                                <h4>Welcome to your chat with {leader.name}!</h4>
                                <p>Start the conversation by asking a question.</p>
                            </div>
                        </div>
                    ) : (
                        messages.map((message) => (
                            <div
                                key={message.id}
                                className={`message ${message.sender === 'user' ? 'user-message' : 'ai-message'}`}
                            >
                                <div className="message-content">
                                    <div className="message-text">{message.text}</div>
                                    <div className="message-time">
                                        {formatTime(message.timestamp)}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                    
                    {isTyping && (
                        <div className="message ai-message typing">
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

                {/* Input Container */}
                <div className="chat-input-container">
                    <form onSubmit={handleSubmit} className="chat-form">
                        <div className="input-wrapper">
                            <textarea
                                ref={inputRef}
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder={`Message ${leader.name}...`}
                                className="chat-input"
                                disabled={isLoading}
                                rows={1}
                            />
                            <button
                                type="submit"
                                className="send-btn"
                                disabled={isLoading || !inputMessage.trim()}
                            >
                                {isLoading ? (
                                    <div className="send-spinner"></div>
                                ) : (
                                    <span className="send-icon">➤</span>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChatPop;
