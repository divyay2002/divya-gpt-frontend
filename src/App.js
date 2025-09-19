import { useState, useEffect, useRef, useCallback } from "react";
import "./App.css";
import axios from "axios";
import { Send, Heart, MessageCircle, User, Bot, Settings } from "lucide-react";
import AdminPage from "./AdminPage";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const Welcome = ({ onStartChat, onAdminAccess }) => {
  const suggestedQuestions = [
    "What are Divya's top projects?",
    "Summarize Divya's recent experience",
    "What roles is Divya targeting now?"
  ];

  const [inputValue, setInputValue] = useState("");
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");

  const handleSubmit = (question) => {
    onStartChat(question || inputValue);
  };

  const handleAdminClick = () => {
    setShowAdminLogin(true);
  };

  const handleAdminLogin = () => {
    // Simple password protection - you can change this password
    if (adminPassword === "DivyaAdmin2024") {
      setShowAdminLogin(false);
      setAdminPassword("");
      onAdminAccess();
    } else {
      alert("Incorrect password!");
      setAdminPassword("");
    }
  };

  return (
    <div className="welcome-container">
      <button 
        onClick={handleAdminClick}
        className="admin-access"
        title="Admin Dashboard"
      >
        <Settings size={20} />
      </button>
      
      {showAdminLogin && (
        <div className="admin-login-modal">
          <div className="admin-login-content">
            <h3>Admin Access</h3>
            <input
              type="password"
              placeholder="Enter admin password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
              className="admin-password-input"
            />
            <div className="admin-login-buttons">
              <button onClick={handleAdminLogin} className="admin-login-btn">
                Login
              </button>
              <button 
                onClick={() => {setShowAdminLogin(false); setAdminPassword("");}} 
                className="admin-cancel-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="welcome-content">
        <div className="welcome-header">
          <h1 className="welcome-title">
            Welcome to Divya-GPT <Heart className="heart-icon" />
          </h1>
          <p className="welcome-subtitle">
            Ask anything about Divya's projects, experience, and goals.
          </p>
        </div>

        <div className="input-section">
          <div className="input-container">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Want to know more about Divya? Ask away..."
              className="welcome-input"
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
            />
            <button 
              onClick={() => handleSubmit()}
              className="send-button"
              disabled={!inputValue.trim()}
            >
              <Send size={20} />
            </button>
          </div>
        </div>

        <div className="suggestions">
          {suggestedQuestions.map((question, index) => (
            <button
              key={index}
              onClick={() => handleSubmit(question)}
              className="suggestion-pill"
            >
              {question}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const ChatInterface = ({ initialMessage, onBack, onAdminAccess }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(generateSessionId());
  const messagesEndRef = useRef(null);
  const initialMessageProcessed = useRef(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = useCallback(async (messageText) => {
    const message = messageText || inputValue.trim();
    if (!message) return;

    const userMessage = {
      id: Date.now(),
      text: message,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await axios.post(`${API}/chat`, {
        message: message,
        session_id: sessionId
      });

      const aiMessage = {
        id: response.data.id,
        text: response.data.response,
        isUser: false,
        timestamp: new Date(response.data.timestamp)
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, I'm having trouble responding right now. Please try again.",
        isUser: false,
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, sessionId]);

  // Handle initial message only once
  useEffect(() => {
    if (initialMessage && !initialMessageProcessed.current) {
      initialMessageProcessed.current = true;
      sendMessage(initialMessage);
    }
  }, [initialMessage, sendMessage]);

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  const handleAdminClick = () => {
    setShowAdminLogin(true);
  };

  const handleAdminLogin = () => {
    if (adminPassword === "DivyaAdmin2024") {
      setShowAdminLogin(false);
      setAdminPassword("");
      onAdminAccess();
    } else {
      alert("Incorrect password!");
      setAdminPassword("");
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <button onClick={onBack} className="back-button">
          ← Back
        </button>
        <div className="chat-title">
          <MessageCircle size={24} />
          <span>Divya-GPT</span>
        </div>
        <button 
          onClick={handleAdminClick}
          className="admin-access"
          title="Admin Dashboard"
          style={{ position: 'static', margin: 0 }}
        >
          <Settings size={20} />
        </button>
      </div>

      {showAdminLogin && (
        <div className="admin-login-modal">
          <div className="admin-login-content">
            <h3>Admin Access</h3>
            <input
              type="password"
              placeholder="Enter admin password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
              className="admin-password-input"
            />
            <div className="admin-login-buttons">
              <button onClick={handleAdminLogin} className="admin-login-btn">
                Login
              </button>
              <button 
                onClick={() => {setShowAdminLogin(false); setAdminPassword("");}} 
                className="admin-cancel-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="messages-container">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${message.isUser ? 'user-message' : 'ai-message'} ${message.isError ? 'error-message' : ''}`}
          >
            <div className="message-avatar">
              {message.isUser ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className="message-content">
              <div className="message-bubble">
                {message.text}
              </div>
              <div className="message-time">
                {message.timestamp.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="message ai-message">
            <div className="message-avatar">
              <Bot size={16} />
            </div>
            <div className="message-content">
              <div className="message-bubble loading">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="input-form">
        <div className="input-container">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            className="chat-input"
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className="send-button"
            disabled={!inputValue.trim() || isLoading}
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
};

function App() {
  const [currentView, setCurrentView] = useState('welcome');
  const [initialMessage, setInitialMessage] = useState('');

  const handleStartChat = (message) => {
    setInitialMessage(message);
    setCurrentView('chat');
  };

  const handleBackToWelcome = () => {
    setCurrentView('welcome');
    setInitialMessage('');
  };

  const handleAdminAccess = () => {
    setCurrentView('admin');
  };

  const handleBackFromAdmin = () => {
    setCurrentView('welcome');
  };

  return (
    <div className="App">
      {currentView === 'welcome' && (
        <Welcome 
          onStartChat={handleStartChat} 
          onAdminAccess={handleAdminAccess}
        />
      )}
      
      {currentView === 'chat' && (
        <ChatInterface 
          initialMessage={initialMessage} 
          onBack={handleBackToWelcome}
          onAdminAccess={handleAdminAccess}
        />
      )}
      
      {currentView === 'admin' && (
        <AdminPage onBack={handleBackFromAdmin} />
      )}
    </div>
  );
}

export default App;