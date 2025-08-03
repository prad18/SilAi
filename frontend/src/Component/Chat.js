import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import '../css/Chat.css'; // Assuming you have a CSS file for styling

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const MAX_MESSAGES = 20; // Maximum number of messages before prompting to clear

const Chat = ({ leader }) => {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [sessionId, setSessionId] = useState(() => {
        // Try to get existing session ID from localStorage
        const storedSessionId = localStorage.getItem(`chat_session_${leader.id}`);
        if (storedSessionId) {
            return storedSessionId;
        }
        // Generate new session ID if none exists
        const newSessionId = uuidv4();
        localStorage.setItem(`chat_session_${leader.id}`, newSessionId);
        return newSessionId;
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showClearPrompt, setShowClearPrompt] = useState(false);
    const messagesEndRef = useRef(null);

    // Get auth token
    const getAuthHeader = () => {
        const token = localStorage.getItem('access');
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    };

    const loadChatHistory = useCallback(async () => {
        try {
            console.log('Loading chat history for leader:', leader.id);
            console.log('Using session ID:', sessionId);
            const response = await axios.get(
                `${API_BASE_URL}/api/leaders/${leader.id}/chat_history/`,
                {
                    params: { session_id: sessionId },
                    headers: getAuthHeader()
                }
            );
            
            console.log('Chat history response:', response.data);
            
            if (response.data.length > 0) {
                const formattedMessages = response.data.flatMap(chat => [
                    { type: 'user', content: chat.user_input },
                    { type: 'ai', content: chat.ai_response }
                ]);
                console.log('Formatted messages:', formattedMessages);
                setMessages(formattedMessages);
            } else {
                console.log('No chat history found, showing welcome message');
                setMessages([{
                    type: 'ai',
                    content: `Hello! I'm ${leader.name}. How can I help you today?`
                }]);
            }
        } catch (error) {
            console.error('Error loading chat history:', error);
            console.error('Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            setMessages([{
                type: 'ai',
                content: `Hello! I'm ${leader.name}. How can I help you today?`
            }]);
        }
    }, [leader.id, sessionId, API_BASE_URL]);

    useEffect(() => {
        console.log('Chat component mounted with leader:', leader);
        console.log('API Base URL:', API_BASE_URL);
        loadChatHistory();
    }, [leader, loadChatHistory]);

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
            
            const response = await axios.post(url, {
                message: userMessage,
                session_id: sessionId
            }, {
                headers: getAuthHeader()
            });

            setMessages(prev => [...prev, { type: 'ai', content: response.data.response }]);

            // Check if we need to show the clear prompt
            if (messages.length >= MAX_MESSAGES) {
                setShowClearPrompt(true);
            }
        } catch (error) {
            console.error('Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            setMessages(prev => [...prev, { 
                type: 'error', 
                content: `Error: ${error.response?.data?.error || error.message || 'Unknown error occurred'}`
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClearChat = async () => {
        try {
            // Call backend to clear chat history
            await axios.post(
                `${API_BASE_URL}/api/leaders/${leader.id}/clear_chat/`,
                { session_id: sessionId },
                {
                    headers: getAuthHeader()
                }
            );

            // Reset local state
            setMessages([{
                type: 'ai',
                content: `Hello! I'm ${leader.name}. How can I help you today?`
            }]);
            // Generate new session ID and store it
            const newSessionId = uuidv4();
            localStorage.setItem(`chat_session_${leader.id}`, newSessionId);
            setSessionId(newSessionId);
            setShowClearPrompt(false);
        } catch (error) {
            console.error('Error clearing chat:', error);
            setMessages(prev => [...prev, { 
                type: 'error', 
                content: 'Failed to clear chat history. Please try again.'
            }]);
        }
    };

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
                {showClearPrompt && (
                    <div className="message system">
                        <div className="message-content">
                            Chat history is getting long. Consider clearing the chat to start fresh.
                            <button onClick={handleClearChat} className="clear-prompt-button">
                                Clear Chat
                            </button>
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