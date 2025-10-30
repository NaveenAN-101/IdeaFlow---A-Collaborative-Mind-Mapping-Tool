import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SessionLanding.css';

const SessionLanding = () => {
  const [sessionId, setSessionId] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleCreateNew = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    console.log('🆕 Creating new session:', newId);
    navigate(`/session/${newId}`);
  };

  const handleJoinSession = (e) => {
    e.preventDefault();
    
    const trimmedId = sessionId.trim();
    
    if (!trimmedId) {
      setError('Please enter a session ID');
      return;
    }

    if (trimmedId.length < 4) {
      setError('Session ID too short');
      return;
    }

    console.log('🔗 Joining session:', trimmedId);
    navigate(`/session/${trimmedId}`);
  };

  return (
    <div className="session-landing">
      <div className="landing-container">
        <div className="landing-header">
          <h1 className="landing-title">
            <span className="brand-icon">🧠</span>
            IdeaFlow
          </h1>
          <p className="landing-subtitle">
            Collaborative Mind Mapping in Real-Time
          </p>
        </div>

        <div className="landing-cards">
          {/* Create New Session Card */}
          <div className="landing-card">
            <div className="card-icon">✨</div>
            <h2>Create New Session</h2>
            <p>Start a fresh mind map and share it with others</p>
            <button 
              className="btn-primary"
              onClick={handleCreateNew}
            >
              Create New Session
            </button>
          </div>

          {/* Join Existing Session Card */}
          <div className="landing-card">
            <div className="card-icon">🔗</div>
            <h2>Join Existing Session</h2>
            <p>Enter a session ID to join a collaborative board</p>
            
            <form onSubmit={handleJoinSession}>
              <input
                type="text"
                className="session-input"
                placeholder="Enter session ID (e.g., m236qnon5)"
                value={sessionId}
                onChange={(e) => {
                  setSessionId(e.target.value);
                  setError('');
                }}
                autoFocus
              />
              
              {error && (
                <div className="error-message">
                  ⚠️ {error}
                </div>
              )}
              
              <button 
                type="submit"
                className="btn-secondary"
              >
                Join Session
              </button>
            </form>
          </div>
        </div>

        <div className="landing-features">
          <div className="feature">
            <span className="feature-icon">⚡</span>
            <span>Real-time Sync</span>
          </div>
          <div className="feature">
            <span className="feature-icon">🎨</span>
            <span>Custom Styling</span>
          </div>
          <div className="feature">
            <span className="feature-icon">💾</span>
            <span>Auto-Save</span>
          </div>
          <div className="feature">
            <span className="feature-icon">📱</span>
            <span>Multi-Device</span>
          </div>
        </div>

        <div className="landing-footer">
          <p>Powered by React, Socket.IO, and Supabase</p>
        </div>
      </div>
    </div>
  );
};

export default SessionLanding;