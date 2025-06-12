import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import './Chat.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const MAX_MESSAGES = 20; // Maximum number of messages before prompting to clear

const Chat = ({ leader }) => {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [sessionId, setSessionId] = useState(uuidv4());
    const [isLoading, setIsLoading] = useState(false);
    const [showClearPrompt, setShowClearPrompt] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        console.log('Chat component mounted with leader:', leader);
        console.log('API Base URL:', API_BASE_URL);
        loadChatHistory();
    }, [leader]);

    const loadChatHistory = async () => {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/api/leaders/${leader.id}/chat_history/`,
                {
                    params: { session_id: sessionId },
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access')}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            if (response.data.length > 0) {
                const formattedMessages = response.data.flatMap(chat => [
                    { type: 'user', content: chat.user_input },
                    { type: 'ai', content: chat.ai_response }
                ]);
                setMessages(formattedMessages);
            } else {
                // If no history, show welcome message
                setMessages([{
                    type: 'ai',
                    content: `Hello! I'm ${leader.name}. How can I help you today?`
                }]);
            }
        } catch (error) {
            console.error('Error loading chat history:', error);
            setMessages([{
                type: 'ai',
                content: `Hello! I'm ${leader.name}. How can I help you today?`
            }]);
        }
    };

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
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('access')}`
                },
                withCredentials: true
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
            await axios.delete(
                `${API_BASE_URL}/api/leaders/${leader.id}/clear_chat/`,
                {
                    params: { session_id: sessionId },
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access')}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Reset local state
            setMessages([{
                type: 'ai',
                content: `Hello! I'm ${leader.name}. How can I help you today?`
            }]);
            setSessionId(uuidv4());
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