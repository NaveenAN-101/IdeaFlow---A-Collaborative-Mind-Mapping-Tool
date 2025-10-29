import React, { useState } from "react";

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

  const copyLink = () => {
    const link = `${window.location.origin}/session/${sessionId}`;
    navigator.clipboard.writeText(link);
    alert("Link copied! Share it with collaborators.");
  };

  const copySessionId = () => {
    navigator.clipboard.writeText(sessionId);
    alert("Session ID copied to clipboard!");
  };

  return (
    <header className="toolbar">
      <div className="toolbar-left">
        <h2>🧠 IdeaFlow</h2>
        <button onClick={onNewSession}>New Session</button>
      </div>

      <div className="toolbar-center">
        <button onClick={onAddNode}>➕ Add Node</button>
        <button
          onClick={onToggleConnect}
          className={connectMode ? "active" : ""}
        >
          🔗 {connectMode ? "Cancel" : "Connect"}
        </button>
        
        {/* REMOVED: Zoom controls (now only in floating panel) */}

        <button onClick={onExportJSON}>💾 JSON</button>
        <button onClick={onExportImage}>📸 Image</button>
      </div>

      <div className="toolbar-right">
        {/* ADDED: Permanent session ID display */}
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
            <p>
              <strong>Session ID:</strong>
            </p>
            <code>{sessionId}</code>
            <button onClick={copyLink}>Copy Link</button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Toolbar;