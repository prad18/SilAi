import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import '../css/ChatPage.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const MAX_MESSAGES = 20; // Maximum number of messages before prompting to clear

// Simple UUID generator (no external dependency needed)
const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

const ChatPage = () => {
    const { leaderId } = useParams();
    const navigate = useNavigate();
    const { access } = useSelector((state) => state.AuthReducer);
    
    // State management - matching original Chat.js
    const [leader, setLeader] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [sessionId, setSessionId] = useState(() => {
        // Try to get existing session ID from localStorage - same as original
        const storedSessionId = localStorage.getItem(`chat_session_${leaderId}`);
        if (storedSessionId) {
            return storedSessionId;
        }
        // Generate new session ID if none exists
        const newSessionId = generateUUID();
        localStorage.setItem(`chat_session_${leaderId}`, newSessionId);
        return newSessionId;
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showClearPrompt, setShowClearPrompt] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
    
    // Refs
    const messagesEndRef = useRef(null);

    // Get auth token - same as original
    const getAuthHeader = () => {
        // Try both Redux state and localStorage
        const token = access || localStorage.getItem('access');
        if (!token) {
            console.error('No access token available');
            navigate('/login');
            return {};
        }
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    };

    // Fetch AI-generated suggestions based on the latest user message
    const fetchSuggestions = useCallback(async (latestUserMessage) => {
        if (!latestUserMessage || !leader) {
            console.log('No latest user message or leader provided for suggestions');
            return;
        }
        
        console.log('=== FETCHING SUGGESTIONS ===');
        console.log('Latest user message:', latestUserMessage);
        console.log('Leader ID:', leader.id);
        console.log('API Base URL:', API_BASE_URL);
        
        setIsSuggestionsLoading(true);
        try {
            const url = `${API_BASE_URL}/api/leaders/${leader.id}/suggestions/`;
            console.log('Suggestions URL:', url);
            
            const response = await axios.post(url, {
                latest_user_message: latestUserMessage
            }, {
                headers: getAuthHeader()
            });
            
            console.log('Suggestions response:', response.data);
            const fetchedSuggestions = response.data.suggestions || [];
            console.log('Parsed suggestions:', fetchedSuggestions);
            setSuggestions(fetchedSuggestions);
        } catch (error) {
            console.error('Error fetching suggestions:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);
            
            // Set fallback suggestions if API fails
            const fallbackSuggestions = [
                `What were ${leader.name}'s major achievements?`,
                `How did ${leader.name} influence their era?`,
                `What challenges did ${leader.name} face?`
            ];
            console.log('Using fallback suggestions:', fallbackSuggestions);
            setSuggestions(fallbackSuggestions);
        } finally {
            setIsSuggestionsLoading(false);
            console.log('=== SUGGESTIONS FETCH COMPLETE ===');
        }
    }, [leader, API_BASE_URL]);

    // Handle suggestion click - fills input and sends the message
    const handleSuggestionClick = (suggestion) => {
        setInputMessage(suggestion);
        // Automatically send the suggestion as a message
        setTimeout(() => {
            const syntheticEvent = { preventDefault: () => {} };
            handleSendMessage(syntheticEvent, suggestion);
        }, 100);
    };

    // Helper function to get image source with fallback
    const getImageSrc = (imagePath) => {
        if (!imagePath || imageError) return '/user.svg';
        if (imagePath.startsWith('http')) return imagePath;
        return `${API_BASE_URL}${imagePath}`;
    };

    // Load chat history - EXACT same function as original Chat.js
    const loadChatHistory = useCallback(async () => {
        try {
            console.log('Loading chat history for leader:', leaderId);
            console.log('Using session ID:', sessionId);
            const response = await axios.get(
                `${API_BASE_URL}/api/leaders/${leaderId}/chat_history/`,
                {
                    params: { session_id: sessionId },
                    headers: getAuthHeader()
                }
            );
            
            console.log('Chat history response:', response.data);
            
            if (response.data.length > 0) {
                const formattedMessages = response.data.flatMap(chat => {
                    const userMessage = { type: 'user', content: chat.user_input };
                    
                    // Parse AI response for citations
                    const { mainContent, citations } = parseResponse(chat.ai_response);
                    const aiMessage = { 
                        type: 'ai', 
                        content: mainContent,
                        citations: citations 
                    };
                    
                    return [userMessage, aiMessage];
                });
                console.log('Formatted messages:', formattedMessages);
                setMessages(formattedMessages);

                // Fetch suggestions based on the last user message
                const lastUserMessage = response.data[response.data.length - 1]?.user_input;
                console.log('Last user message for suggestions:', lastUserMessage);
                if (lastUserMessage && leader) {
                    console.log('Fetching suggestions based on chat history');
                    fetchSuggestions(lastUserMessage);
                } else if (leader) {
                    console.log('No last user message found, using generic prompt');
                    fetchSuggestions(`Tell me about ${leader.name}`);
                }
            } else {
                console.log('No chat history found, showing welcome message');
                // Only set welcome message if leader is loaded
                if (leader && leader.name) {
                    setMessages([{
                        type: 'ai',
                        content: `Hello! I'm ${leader.name}. How can I help you today?`
                    }]);
                    
                    // Fetch initial suggestions with a generic prompt
                    console.log('Fetching initial suggestions for new chat');
                    fetchSuggestions(`Tell me about ${leader.name}`);
                }
            }
        } catch (error) {
            console.error('Error loading chat history:', error);
            console.error('Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            // Only set welcome message if leader is loaded
            if (leader && leader.name) {
                setMessages([{
                    type: 'ai',
                    content: `Hello! I'm ${leader.name}. How can I help you today?`
                }]);
                
                // Fetch fallback suggestions even on error
                fetchSuggestions(`Tell me about ${leader.name}`);
            }
        }
    }, [leaderId, sessionId, leader, fetchSuggestions]);

    // Auto-scroll to bottom of messages
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Load leader data
    useEffect(() => {
        const fetchLeader = async () => {
            if (!leaderId || !access) {
                console.log('Missing requirements for fetching leader:', { leaderId, hasAccess: !!access });
                return;
            }
            
            try {
                console.log('Fetching leader data for ID:', leaderId);
                console.log('Using access token:', access ? 'Present' : 'Missing');
                const response = await axios.get(
                    `${API_BASE_URL}/api/leaders/${leaderId}/`,
                    { headers: getAuthHeader() }
                );
                setLeader(response.data);
                console.log('Leader data loaded successfully:', response.data);
            } catch (error) {
                console.error('Error fetching leader:', error);
                console.error('Error status:', error.response?.status);
                console.error('Error data:', error.response?.data);
                // Don't navigate immediately, give user feedback
                setMessages([{
                    type: 'error',
                    content: 'Failed to load leader information. Please try again or go back to home.'
                }]);
            }
        };

        fetchLeader();
    }, [leaderId, access]);

    // Load chat history when component mounts - same as original
    useEffect(() => {
        if (leader && leader.name) {
            console.log('Chat component mounted with leader:', leader);
            console.log('API Base URL:', API_BASE_URL);
            loadChatHistory();
        }
    }, [leader, loadChatHistory]);

    // Parse response to separate main content from citations
    const parseResponse = (response) => {
        const citationIndex = response.indexOf('\nCitations:\n');
        if (citationIndex !== -1) {
            const mainContent = response.substring(0, citationIndex).trim();
            const citationsText = response.substring(citationIndex + '\nCitations:\n'.length).trim();
            const citations = citationsText.split('\n').filter(citation => citation.trim() !== '');
            return { mainContent, citations };
        }
        return { mainContent: response, citations: [] };
    };

    // Send message function - EXACT same logic as original Chat.js
    const handleSendMessage = async (e, suggestionText = null) => {
        e.preventDefault();
        const messageToSend = suggestionText || inputMessage;
        if (!messageToSend.trim()) return;

        setInputMessage('');
        setMessages(prev => [...prev, { type: 'user', content: messageToSend }]);
        setIsLoading(true);

        try {
            const url = `${API_BASE_URL}/api/leaders/${leaderId}/chat/`;
            console.log('Sending message to:', url);
            
            const response = await axios.post(url, {
                message: messageToSend,
                session_id: sessionId
            }, {
                headers: getAuthHeader()
            });

            // Parse the response to separate main content from citations
            const { mainContent, citations } = parseResponse(response.data.response);
            
            setMessages(prev => [...prev, { 
                type: 'ai', 
                content: mainContent,
                citations: citations 
            }]);

            // Fetch new suggestions based on the message just sent
            if (leader) {
                fetchSuggestions(messageToSend);
            }

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

    // Clear chat function - EXACT same as original Chat.js
    const handleClearChat = async () => {
        try {
            // Call backend to clear chat history
            await axios.post(
                `${API_BASE_URL}/api/leaders/${leaderId}/clear_chat/`,
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
            const newSessionId = generateUUID();
            localStorage.setItem(`chat_session_${leaderId}`, newSessionId);
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

    // Handle key press
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(e);
        }
    };

    // Back to home function
    const goBack = () => {
        navigate('/home');
    };

    // If no access token, redirect to login
    if (!access) {
        navigate('/login');
        return null;
    }

    // Loading state - show while leader data is being fetched
    if (!leader && !messages.some(msg => msg.type === 'error')) {
        return (
            <div className="chat-page">
                <div className="loading-container">
                    <div className="loading-spinner">
                        <div className="spinner"></div>
                        <p>Loading chat...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="chat-page">
            {/* Header */}
            <div className="chat-header">
                <button className="back-button" onClick={goBack}>
                    ← Back to Home
                </button>
                
                <div className="leader-info">
                    <img 
                        src={getImageSrc(leader?.image)} 
                        alt={leader?.name || 'Leader'}
                        className="leader-avatar"
                        onError={() => setImageError(true)}
                        onLoad={() => setImageError(false)}
                    />
                    <div className="leader-details">
                        <h2>{leader?.name || 'Loading...'}</h2>
                        <p className="leader-description">{leader?.description || 'Loading leader information...'}</p>
                    </div>
                </div>
                
                <button className="clear-chat-button" onClick={handleClearChat}>
                    🗑️ Clear Chat
                </button>
            </div>

            {/* Suggestions Section */}
            <div className="suggestions-container">
                {/* Debug info - remove this later */}
                <div style={{fontSize: '12px', color: '#666', marginBottom: '5px'}}>
                    Debug: Suggestions count: {suggestions.length}, Loading: {isSuggestionsLoading.toString()}
                </div>
                
                {isSuggestionsLoading ? (
                    <div className="suggestions-loading">
                        <span>🤔 Thinking of questions...</span>
                    </div>
                ) : suggestions.length > 0 ? (
                    <div className="suggestions-scroll">
                        {suggestions.map((suggestion, index) => (
                            <button
                                key={index}
                                className="suggestion-chip"
                                onClick={() => handleSuggestionClick(suggestion)}
                                disabled={isLoading}
                            >
                                💬 {suggestion}
                            </button>
                        ))}
                    </div>
                ) : (
                    <div style={{padding: '10px', color: '#999', fontSize: '14px'}}>
                        No suggestions available
                    </div>
                )}
            </div>

            {/* Messages Container - Exact same structure as original */}
            <div className="messages-container">
                <div className="messages-wrapper">
                    {messages.map((message, index) => (
                        <div key={index} className={`message ${message.type}`}>
                            <div className="message-content">
                                {message.content}
                                {message.citations && message.citations.length > 0 && (
                                    <div className="citations">
                                        <div className="citations-header">📚 Sources:</div>
                                        <ul className="citations-list">
                                            {message.citations.map((citation, citIndex) => (
                                                <li key={citIndex} className="citation-item">
                                                    {citation}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
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
            </div>

            {/* Input Container - Same as original but with updated styling */}
            <div className="input-container">
                <form onSubmit={handleSendMessage} className="message-form">
                    <div className="input-wrapper">
                        <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type your message..."
                            className="message-input"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            className="send-button"
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
    );
};

export default ChatPage;