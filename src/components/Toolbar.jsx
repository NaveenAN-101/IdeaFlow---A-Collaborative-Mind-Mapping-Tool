import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Toolbar = ({
  onAddNode,
  onExportJSON,
  onExportImage,
  onToggleConnect,
  connectMode,
  sessionId,
  onNewSession,
}) => {
  const [showShare, setShowShare] = useState(false);
  const navigate = useNavigate();

  const copyLink = () => {
    const link = `${window.location.origin}/session/${sessionId}`;
    navigator.clipboard.writeText(link);
    alert("Link copied! Share it with collaborators.");
  };

  const copySessionId = () => {
    navigator.clipboard.writeText(sessionId);
    alert("Session ID copied to clipboard!");
  };

  const goHome = () => {
    if (window.confirm("Leave this session and go to home?")) {
      navigate('/');
    }
  };

  return (
    <header className="toolbar">
      <div className="toolbar-left">
        <h2 style={{ cursor: 'pointer' }} onClick={goHome}>
          🧠 IdeaFlow
        </h2>
        <button onClick={onNewSession}>New Session</button>
      </div>

      {/* Rest of your toolbar code stays the same */}
      <div className="toolbar-center">
        <button onClick={onAddNode}>➕ Add Node</button>
        <button
          onClick={onToggleConnect}
          className={connectMode ? "active" : ""}
        >
          🔗 {connectMode ? "Cancel" : "Connect"}
        </button>
        <button onClick={onExportJSON}>💾 JSON</button>
        <button onClick={onExportImage}>📸 Image</button>
      </div>

      <div className="toolbar-right">
        <div 
          className="session-id-display" 
          onClick={copySessionId}
          title="Click to copy session ID"
        >
          <span>Session: {sessionId.substring(0, 8)}</span>
          <span className="copy-icon">📋</span>
        </div>
        
        <button onClick={() => setShowShare(!showShare)}>📤 Share</button>
        
        {showShare && (
          <div className="share-popup">
            <p><strong>Session ID:</strong></p>
            <code>{sessionId}</code>
            <button onClick={copyLink}>Copy Link</button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Toolbar;