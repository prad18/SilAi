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
    const [suggestions, setSuggestions] = useState([]);
    const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Get auth token
    const getAuthHeader = () => {
        const token = localStorage.getItem('access');
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    };

    // Fetch AI-generated suggestions based on the latest user message
    const fetchSuggestions = useCallback(async (latestUserMessage) => {
        if (!latestUserMessage) {
            console.log('No latest user message provided for suggestions');
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
    }, [leader.id, leader.name, API_BASE_URL]);

    // Handle suggestion click - fills input and sends the message
    const handleSuggestionClick = (suggestion) => {
        setInputMessage(suggestion);
        // Automatically send the suggestion as a message
        setTimeout(() => {
            const syntheticEvent = { preventDefault: () => {} };
            handleSendMessage(syntheticEvent, suggestion);
        }, 100);
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

                // Fetch suggestions based on the last user message
                const lastUserMessage = response.data[response.data.length - 1]?.user_input;
                console.log('Last user message for suggestions:', lastUserMessage);
                if (lastUserMessage) {
                    console.log('Fetching suggestions based on chat history');
                    fetchSuggestions(lastUserMessage);
                } else {
                    console.log('No last user message found, using generic prompt');
                    fetchSuggestions(`Tell me about ${leader.name}`);
                }
            } else {
                console.log('No chat history found, showing welcome message');
                setMessages([{
                    type: 'ai',
                    content: `Hello! I'm ${leader.name}. How can I help you today?`
                }]);
                
                // Fetch initial suggestions with a generic prompt
                console.log('Fetching initial suggestions for new chat');
                fetchSuggestions(`Tell me about ${leader.name}`);
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
            
            // Fetch fallback suggestions even on error
            fetchSuggestions(`Tell me about ${leader.name}`);
        }
    }, [leader.id, sessionId, API_BASE_URL, fetchSuggestions]);

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

    const handleSendMessage = async (e, suggestionText = null) => {
        e.preventDefault();
        const messageToSend = suggestionText || inputMessage;
        if (!messageToSend.trim()) return;

        setInputMessage('');
        setMessages(prev => [...prev, { type: 'user', content: messageToSend }]);
        setIsLoading(true);

        try {
            const url = `${API_BASE_URL}/api/leaders/${leader.id}/chat/`;
            console.log('Sending message to:', url);
            
            const response = await axios.post(url, {
                message: messageToSend,
                session_id: sessionId
            }, {
                headers: getAuthHeader()
            });

            setMessages(prev => [...prev, { type: 'ai', content: response.data.response }]);

            // Fetch new suggestions based on the message just sent
            fetchSuggestions(messageToSend);

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
            
            // Reset and fetch new suggestions
            setSuggestions([]);
            fetchSuggestions(`Tell me about ${leader.name}`);
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