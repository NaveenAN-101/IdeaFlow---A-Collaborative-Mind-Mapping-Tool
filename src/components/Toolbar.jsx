import React, { useState } from "react";

const Toolbar = ({
  onAddNode,
  onExportJSON,
  onExportImage,
  onToggleConnect,
  connectMode,
  sessionId,
  onNewSession,
  zoom,
  onZoomIn,
  onZoomOut,
  onResetView,
}) => {
  const [showShare, setShowShare] = useState(false);

  const copyLink = () => {
    const link = `${window.location.origin}/session/${sessionId}`;
    navigator.clipboard.writeText(link);
    alert("Link copied! Share it with collaborators.");
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
        
        {/* Zoom controls in toolbar */}
        <div className="toolbar-zoom">
          <button onClick={onZoomOut} title="Zoom Out">🔍−</button>
          <span className="zoom-level">{Math.round(zoom * 100)}%</span>
          <button onClick={onZoomIn} title="Zoom In">🔍+</button>
          <button onClick={onResetView} title="Reset View">⟲</button>
        </div>

        <button onClick={onExportJSON}>💾 JSON</button>
        <button onClick={onExportImage}>📸 Image</button>
      </div>

      <div className="toolbar-right">
        <button onClick={() => setShowShare(!showShare)}>📤 Share</button>
        {showShare && (
          <div className="share-popup">
            <p>
              Session ID: <code>{sessionId}</code>
            </p>
            <button onClick={copyLink}>Copy Link</button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Toolbar;