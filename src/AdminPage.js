import { useState, useEffect } from "react";
import axios from "axios";
import { ArrowLeft, MessageSquare, Users, Activity, Clock, User, Bot } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminPage = ({ onBack }) => {
  const [chats, setChats] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [chatsResponse, statsResponse] = await Promise.all([
        axios.get(`${API}/admin/chats`),
        axios.get(`${API}/admin/stats`)
      ]);
      
      setChats(chatsResponse.data);
      setStats(statsResponse.data);
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const groupChatsBySession = () => {
    const grouped = {};
    chats.forEach(chat => {
      if (!grouped[chat.session_id]) {
        grouped[chat.session_id] = [];
      }
      grouped[chat.session_id].push(chat);
    });
    
    Object.keys(grouped).forEach(sessionId => {
      grouped[sessionId].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    });
    
    return grouped;
  };

  const groupedChats = groupChatsBySession();

  if (loading) {
    return (
      <div className="admin-container">
        <div className="admin-loading">
          <div className="loading-spinner"></div>
          <p>Loading admin data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <button onClick={onBack} className="back-button">
          <ArrowLeft size={20} />
          Back to Chat
        </button>
        <h1 className="admin-title">Divya-GPT Admin Dashboard</h1>
      </div>

      <div className="admin-stats">
        <div className="stat-card">
          <MessageSquare className="stat-icon" />
          <div className="stat-content">
            <div className="stat-number">{stats.total_messages || 0}</div>
            <div className="stat-label">Total Messages</div>
          </div>
        </div>
        
        <div className="stat-card">
          <Users className="stat-icon" />
          <div className="stat-content">
            <div className="stat-number">{stats.unique_sessions || 0}</div>
            <div className="stat-label">Unique Visitors</div>
          </div>
        </div>
        
        <div className="stat-card">
          <Activity className="stat-icon" />
          <div className="stat-content">
            <div className="stat-number">{stats.total_conversations || 0}</div>
            <div className="stat-label">Conversations</div>
          </div>
        </div>
      </div>

      <div className="admin-content">
        <div className="conversations-panel">
          <h2 className="panel-title">Recent Conversations</h2>
          <div className="conversations-list">
            {Object.entries(groupedChats).map(([sessionId, sessionChats]) => (
              <div 
                key={sessionId} 
                className={`conversation-item ${selectedChat === sessionId ? 'selected' : ''}`}
                onClick={() => setSelectedChat(sessionId)}
              >
                <div className="conversation-header">
                  <div className="conversation-info">
                    <strong>Session: {sessionId.slice(-8)}</strong>
                    <span className="message-count">{sessionChats.length} messages</span>
                  </div>
                  <div className="conversation-time">
                    <Clock size={14} />
                    {formatTimestamp(sessionChats[0].timestamp)}
                  </div>
                </div>
                <div className="conversation-preview">
                  {sessionChats[0].message.slice(0, 80)}...
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="chat-details-panel">
          {selectedChat ? (
            <div className="chat-details">
              <h2 className="panel-title">
                Conversation Details - {selectedChat.slice(-8)}
              </h2>
              <div className="messages-detailed">
                {groupedChats[selectedChat].map((chat, index) => (
                  <div key={chat.id} className="detailed-message-pair">
                    <div className="detailed-message user-detailed">
                      <div className="message-header">
                        <User size={16} />
                        <span>User</span>
                        <span className="timestamp">{formatTimestamp(chat.timestamp)}</span>
                      </div>
                      <div className="message-text">{chat.message}</div>
                    </div>
                    
                    <div className="detailed-message ai-detailed">
                      <div className="message-header">
                        <Bot size={16} />
                        <span>Divya-GPT</span>
                        <span className="timestamp">{formatTimestamp(chat.timestamp)}</span>
                      </div>
                      <div className="message-text">{chat.response}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="no-selection">
              <MessageSquare size={48} />
              <p>Select a conversation to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;