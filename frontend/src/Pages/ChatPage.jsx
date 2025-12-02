import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import '../css/ChatPage.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const MAX_MESSAGES = 20; // Maximum number of messages before prompting to clear

// Helper function to generate UUID
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
    
    // State management
    const [leader, setLeader] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [sessionId, setSessionId] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showClearPrompt, setShowClearPrompt] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
    const [editingSessionId, setEditingSessionId] = useState(null);
    const [editingSessionName, setEditingSessionName] = useState('');
    
    // Refs
    const messagesEndRef = useRef(null);

    // Session management functions
    const fetchSessions = async () => {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/api/leaders/${leaderId}/get_sessions/`,
                { headers: getAuthHeader() }
            );
            return response.data.sessions || [];
        } catch (error) {
            console.error('Error fetching sessions:', error);
            return [];
        }
    };

    const createNewSession = async (sessionName = 'New Chat') => {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/api/leaders/${leaderId}/create_session/`,
                { session_name: sessionName },
                { headers: getAuthHeader() }
            );
            return response.data;
        } catch (error) {
            console.error('Error creating session:', error);
            throw error;
        }
    };

    const renameSession = async (sessionId, newName) => {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/api/leaders/${leaderId}/rename_session/`,
                { session_id: sessionId, session_name: newName },
                { headers: getAuthHeader() }
            );
            return response.data;
        } catch (error) {
            console.error('Error renaming session:', error);
            throw error;
        }
    };

    const deleteSession = async (sessionIdToDelete) => {
        try {
            await axios.post(
                `${API_BASE_URL}/api/leaders/${leaderId}/delete_session/`,
                { session_id: sessionIdToDelete },
                { headers: getAuthHeader() }
            );
            
            // Refresh sessions list
            const updatedSessions = await fetchSessions();
            setSessions(updatedSessions);
            
            // If we deleted the current session, switch to another one or create new
            if (sessionIdToDelete === sessionId) {
                if (updatedSessions.length > 0) {
                    setSessionId(updatedSessions[0].session_id);
                } else {
                    const newSession = await createNewSession();
                    setSessionId(newSession.session_id);
                    setSessions([newSession]);
                }
                
                // Reset messages
                setMessages([{
                    type: 'ai',
                    content: `Hello! I'm ${leader?.name}. How can I help you today?`
                }]);
            }
        } catch (error) {
            console.error('Error deleting session:', error);
            throw error;
        }
    };

    const initializeSession = async () => {
        try {
            // Fetch existing sessions
            const sessionsList = await fetchSessions();
            setSessions(sessionsList);
            
            if (sessionsList.length > 0) {
                // Use the most recent session
                const latestSession = sessionsList[0];
                setSessionId(latestSession.session_id);
            } else {
                // Create a new session if none exist with leader's name
                const initialName = leader?.name ? `Chat with ${leader.name}` : 'New Chat';
                const newSession = await createNewSession(initialName);
                setSessionId(newSession.session_id);
                setSessions([newSession]);
            }
        } catch (error) {
            console.error('Error initializing session:', error);
            // Fallback: create a session with UUID
            const fallbackSessionId = generateUUID();
            setSessionId(fallbackSessionId);
        }
    };


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
            handleSendMessageStream(syntheticEvent, suggestion);
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

    // Initialize session when component mounts
    useEffect(() => {
        if (leaderId && access) {
            initializeSession();
        }
    }, [leaderId, access]);

    // Load chat history when session is ready
    useEffect(() => {
        if (leader && leader.name && sessionId) {
            console.log('Chat component mounted with leader:', leader);
            console.log('Using session ID:', sessionId);
            console.log('API Base URL:', API_BASE_URL);
            loadChatHistory();
        }
    }, [leader, sessionId, loadChatHistory]);

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

    // New streaming message handler
    const handleSendMessageStream = async (e, suggestionText = null) => {
        e.preventDefault();
        const messageToSend = suggestionText || inputMessage;
        if (!messageToSend.trim()) return;

        setInputMessage('');
        setMessages(prev => [...prev, { type: 'user', content: messageToSend }]);
        setIsLoading(true);

        // Add empty AI message that will be updated as stream comes in
        setMessages(prev => [...prev, { 
            type: 'ai', 
            content: '',
            citations: [],
            streaming: true 
        }]);

        try {
            const url = `${API_BASE_URL}/api/leaders/${leaderId}/chat/`;
            console.log('Sending streaming message to:', url);
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    ...getAuthHeader(),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: messageToSend,
                    session_id: sessionId,
                    streaming: true  // Enable streaming mode
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop(); // Keep incomplete line in buffer

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            
                            if (data.error) {
                                setMessages(prev => {
                                    const newMessages = [...prev];
                                    // Find the last streaming AI message and update it
                                    for (let i = newMessages.length - 1; i >= 0; i--) {
                                        if (newMessages[i].type === 'ai' && newMessages[i].streaming) {
                                            newMessages[i] = {
                                                type: 'error',
                                                content: `Error: ${data.error}`
                                            };
                                            break;
                                        }
                                    }
                                    return newMessages;
                                });
                                break;
                            }

                            // Update the streaming message
                            setMessages(prev => {
                                const newMessages = [...prev];
                                const { mainContent, citations } = parseResponse(data.content);
                                // Find the last streaming AI message and update it
                                for (let i = newMessages.length - 1; i >= 0; i--) {
                                    if (newMessages[i].type === 'ai' && newMessages[i].streaming !== undefined) {
                                        newMessages[i] = {
                                            type: 'ai',
                                            content: mainContent,
                                            citations: citations,
                                            streaming: !data.done
                                        };
                                        break;
                                    }
                                }
                                return newMessages;
                            });

                            // If streaming is complete, fetch suggestions and auto-name session
                            if (data.done && leader) {
                                fetchSuggestions(messageToSend);
                                
                                // Auto-rename session if it's still using default name
                                const currentSession = sessions.find(s => s.session_id === sessionId);
                                if (currentSession && 
                                    (currentSession.session_name === 'New Chat' || 
                                     currentSession.session_name === `Chat with ${leader.name}`) &&
                                    currentSession.message_count <= 2) {
                                    
                                    // Create a meaningful name from the first user message
                                    const sessionName = messageToSend.length > 50 
                                        ? messageToSend.substring(0, 47) + '...'
                                        : messageToSend;
                                    
                                    try {
                                        await renameSession(sessionId, sessionName);
                                        const updatedSessions = await fetchSessions();
                                        setSessions(updatedSessions);
                                    } catch (error) {
                                        console.error('Error auto-renaming session:', error);
                                    }
                                }
                            }

                        } catch (parseError) {
                            console.error('Error parsing streaming data:', parseError);
                        }
                    }
                }
            }

            // Check if we need to show the clear prompt
            if (messages.length >= MAX_MESSAGES) {
                setShowClearPrompt(true);
            }

        } catch (error) {
            console.error('Error in streaming chat:', error);
            setMessages(prev => {
                const newMessages = [...prev];
                // Find the last streaming AI message and update it with error
                for (let i = newMessages.length - 1; i >= 0; i--) {
                    if (newMessages[i].type === 'ai' && newMessages[i].streaming !== undefined) {
                        newMessages[i] = {
                            type: 'error',
                            content: `Error: ${error.message || 'Unknown error occurred'}`
                        };
                        break;
                    }
                }
                return newMessages;
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Clear chat function - Updated for backend session management
    const handleClearChat = async () => {
        try {
            // Delete the current session (this will also delete all chats)
            await axios.post(
                `${API_BASE_URL}/api/leaders/${leaderId}/delete_session/`,
                { session_id: sessionId },
                {
                    headers: getAuthHeader()
                }
            );

            // Create a new session
            const newSession = await createNewSession();
            setSessionId(newSession.session_id);

            // Update sessions list
            const updatedSessions = await fetchSessions();
            setSessions(updatedSessions);

            // Reset local state
            setMessages([{
                type: 'ai',
                content: `Hello! I'm ${leader.name}. How can I help you today?`
            }]);
            
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
            handleSendMessageStream(e);
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
                        <p className="leader-description">{leader?.bio || 'Loading leader information...'}</p>
                    </div>
                </div>
                
                {/* Session Management */}
                <div className="session-management">
                    <div className="session-selector">
                        <div className="session-controls">
                            <select 
                                value={sessionId || ''} 
                                onChange={(e) => {
                                    const selectedSessionId = e.target.value;
                                    if (selectedSessionId && selectedSessionId !== sessionId) {
                                        setSessionId(selectedSessionId);
                                    }
                                }}
                                className="session-select"
                            >
                                {sessions.map(session => (
                                    <option key={session.session_id} value={session.session_id}>
                                        {session.session_name} ({session.message_count} messages)
                                    </option>
                                ))}
                            </select>
                            
                            <div className="session-actions">
                                <button 
                                    className="session-action-btn edit-btn"
                                    onClick={() => {
                                        const currentSession = sessions.find(s => s.session_id === sessionId);
                                        if (currentSession) {
                                            setEditingSessionId(sessionId);
                                            setEditingSessionName(currentSession.session_name);
                                        }
                                    }}
                                    title="Rename session"
                                    disabled={!sessionId || sessions.length === 0}
                                >
                                    ✏️
                                </button>
                                
                                <button 
                                    className="session-action-btn delete-btn"
                                    onClick={async () => {
                                        if (sessionId && window.confirm('Are you sure you want to delete this chat session? This action cannot be undone.')) {
                                            try {
                                                await deleteSession(sessionId);
                                            } catch (error) {
                                                alert('Failed to delete session. Please try again.');
                                            }
                                        }
                                    }}
                                    title="Delete session"
                                    disabled={!sessionId || sessions.length === 0}
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                        
                        <button 
                            className="new-chat-button"
                            onClick={async () => {
                                try {
                                    const sessionName = leader?.name ? `Chat with ${leader.name}` : 'New Chat';
                                    const newSession = await createNewSession(sessionName);
                                    setSessionId(newSession.session_id);
                                    const updatedSessions = await fetchSessions();
                                    setSessions(updatedSessions);
                                    setMessages([{
                                        type: 'ai',
                                        content: `Hello! I'm ${leader.name}. How can I help you today?`
                                    }]);
                                } catch (error) {
                                    console.error('Error creating new session:', error);
                                }
                            }}
                        >
                            + New Chat
                        </button>
                    </div>
                    
                    {/* Session Rename Modal */}
                    {editingSessionId && (
                        <div className="rename-modal-overlay" onClick={() => setEditingSessionId(null)}>
                            <div className="rename-modal" onClick={(e) => e.stopPropagation()}>
                                <h3>Rename Chat Session</h3>
                                <input
                                    type="text"
                                    value={editingSessionName}
                                    onChange={(e) => setEditingSessionName(e.target.value)}
                                    className="rename-input"
                                    placeholder="Enter new session name"
                                    autoFocus
                                />
                                <div className="rename-actions">
                                    <button 
                                        onClick={async () => {
                                            try {
                                                if (editingSessionName.trim()) {
                                                    await renameSession(editingSessionId, editingSessionName.trim());
                                                    const updatedSessions = await fetchSessions();
                                                    setSessions(updatedSessions);
                                                    setEditingSessionId(null);
                                                    setEditingSessionName('');
                                                }
                                            } catch (error) {
                                                alert('Failed to rename session. Please try again.');
                                            }
                                        }}
                                        className="rename-save-btn"
                                    >
                                        Save
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setEditingSessionId(null);
                                            setEditingSessionName('');
                                        }}
                                        className="rename-cancel-btn"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                
                <div className="chat-buttons-row">
                    <button className="back-button" onClick={goBack}>
                        ← Back to Home
                    </button>
                    
                    <button className="clear-chat-button" onClick={handleClearChat}>
                        🗑️ Clear Chat
                    </button>
                </div>
            </div>

            {/* Suggestions Section */}
            <div className="suggestions-container">
                {/* Debug info - remove this later
                <div style={{fontSize: '12px', color: '#666', marginBottom: '5px'}}>
                    Debug: Suggestions count: {suggestions.length}, Loading: {isSuggestionsLoading.toString()}
                </div> */}
                
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
                            <div className={`message-content ${message.streaming ? 'streaming' : ''}`}>
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
                <form onSubmit={handleSendMessageStream} className="message-form">
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