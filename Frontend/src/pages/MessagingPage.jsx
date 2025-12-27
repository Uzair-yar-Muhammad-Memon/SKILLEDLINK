import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageAPI, RequestAPI } from '../api/client';
import { useSocket } from '../context/SocketContext';
import { useRole } from '../context/RoleContext';

export default function MessagingPage() {
  const { requestId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const { socket } = useSocket();
  const { user, role } = useRole();
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, [requestId]);

  useEffect(() => {
    if (socket && requestId) {
      // Join request room for real-time messages
      socket.emit('joinRequest', requestId);

      // Listen for new messages
      socket.on('newMessage', (data) => {
        if (data.serviceRequestId === requestId) {
          setMessages((prev) => [...prev, data.message]);
          scrollToBottom();
          
          // Mark as read
          MessageAPI.markAsRead(requestId).catch(console.error);
        }
      });

      return () => {
        socket.emit('leaveRequest', requestId);
        socket.off('newMessage');
      };
    }
  }, [socket, requestId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [requestRes, messagesRes] = await Promise.all([
        RequestAPI.getById(requestId),
        MessageAPI.getMessages(requestId)
      ]);
      
      setRequest(requestRes.data);
      setMessages(messagesRes.data || []);
      
      // Mark messages as read
      await MessageAPI.markAsRead(requestId);
    } catch (error) {
      console.error('Failed to load data:', error);
      alert('Failed to load conversation');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      const response = await MessageAPI.send({
        serviceRequestId: requestId,
        content: newMessage.trim()
      });
      
      setMessages((prev) => [...prev, response.data]);
      setNewMessage('');
      scrollToBottom();
    } catch (error) {
      alert('Failed to send message: ' + error.message);
    } finally {
      setSending(false);
    }
  };

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Text-to-speech not supported in this browser');
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>
        Loading conversation...
      </div>
    );
  }

  if (!request) {
    return (
      <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Conversation not found</p>
        <button onClick={() => navigate(-1)} className="btn">Go Back</button>
      </div>
    );
  }

  // Check if messaging is allowed
  if (request.status === 'pending' || request.status === 'rejected' || request.status === 'cancelled') {
    return (
      <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Messaging is only available for in-progress or completed requests</p>
        <button onClick={() => navigate(-1)} className="btn">Go Back</button>
      </div>
    );
  }

  const otherPerson = role === 'user' ? request.worker : request.user;
  const isMyMessage = (message) => {
    return message.sender._id === user._id;
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: 'calc(100vh - 80px)',
      maxWidth: '900px',
      margin: '0 auto'
    }}>
      {/* Header */}
      <div style={{ 
        padding: '1rem 1.5rem', 
        background: 'var(--card-bg)', 
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <button 
          onClick={() => navigate(-1)}
          style={{ 
            background: 'none', 
            border: 'none', 
            fontSize: '1.5rem', 
            cursor: 'pointer',
            color: 'var(--text)'
          }}
        >
          ←
        </button>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0 }}>{otherPerson.name}</h3>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-light)' }}>
            {request.title}
          </p>
        </div>
        <div style={{ 
          padding: '0.5rem 1rem', 
          borderRadius: '8px', 
          background: 'var(--primary)',
          color: 'white',
          fontSize: '0.85rem',
          fontWeight: 'bold'
        }}>
          {request.status.toUpperCase()}
        </div>
      </div>

      {/* Messages */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: '1.5rem',
        background: 'var(--bg)'
      }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-light)' }}>
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message, index) => {
            const isMine = isMyMessage(message);
            return (
              <div 
                key={message._id || index}
                style={{ 
                  display: 'flex', 
                  justifyContent: isMine ? 'flex-end' : 'flex-start',
                  marginBottom: '1rem'
                }}
              >
                <div style={{ 
                  maxWidth: '70%',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  background: isMine ? 'var(--primary)' : 'var(--card-bg)',
                  color: isMine ? 'white' : 'var(--text)',
                  position: 'relative'
                }}>
                  {!isMine && (
                    <div style={{ 
                      fontSize: '0.75rem', 
                      fontWeight: 'bold', 
                      marginBottom: '0.25rem',
                      opacity: 0.8
                    }}>
                      {message.sender.name}
                    </div>
                  )}
                  <div>{message.content}</div>
                  <div style={{ 
                    display: 'flex', 
                    gap: '0.5rem', 
                    alignItems: 'center',
                    marginTop: '0.25rem',
                    fontSize: '0.7rem',
                    opacity: 0.7
                  }}>
                    <span>
                      {new Date(message.createdAt).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                    {isMine && (
                      <span>
                        {message.status === 'read' ? '✓✓' : message.status === 'delivered' ? '✓' : '○'}
                      </span>
                    )}
                    <button
                      onClick={() => speak(message.content)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        padding: '0.25rem',
                        opacity: 0.7
                      }}
                      title="Listen to message"
                    >
                      🔊
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      {request.status !== 'completed' && request.status !== 'cancelled' ? (
        <form 
          onSubmit={handleSend}
          style={{ 
            padding: '1rem 1.5rem', 
            background: 'var(--card-bg)', 
            borderTop: '1px solid var(--border)',
            display: 'flex',
            gap: '0.75rem'
          }}
        >
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            style={{ 
              flex: 1, 
              padding: '0.75rem 1rem', 
              borderRadius: '24px', 
              border: '1px solid var(--border)',
              fontSize: '1rem',
              background: 'var(--bg)'
            }}
          />
          <button 
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="btn"
            style={{ 
              borderRadius: '24px',
              padding: '0.75rem 1.5rem',
              fontSize: '1rem'
            }}
          >
            {sending ? '⏳' : '📤'} Send
          </button>
        </form>
      ) : (
        <div style={{ 
          padding: '1rem 1.5rem', 
          background: 'var(--card-bg)', 
          borderTop: '1px solid var(--border)',
          textAlign: 'center',
          color: 'var(--text-light)'
        }}>
          This conversation is closed ({request.status})
        </div>
      )}
    </div>
  );
}
