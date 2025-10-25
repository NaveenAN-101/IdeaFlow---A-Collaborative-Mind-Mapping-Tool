// components/Node.jsx
import { useState } from 'react';

export default function Node({ node, onDrag, onTextChange, onDotClick, isConnecting, isStartNode, deleteMode }) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(node.text);

  const handleMouseDown = (e) => {
    if (deleteMode) return; // Don't allow dragging in delete mode
    if (e.button !== 0) return; // Left click only
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const nodeStartX = node.x;
    const nodeStartY = node.y;

    const onMouseMove = (moveEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      onDrag(node.id, nodeStartX + dx, nodeStartY + dy);
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const handleDoubleClick = () => {
    if (!deleteMode) {
      setIsEditing(true);
    }
  };

  const handleChange = (e) => {
    setText(e.target.value);
  };

  const handleBlur = () => {
    if (text.trim() === '') {
      setText(node.text); // Revert if empty
    }
    setIsEditing(false);
    onTextChange(node.id, text);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.target.blur();
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: node.y,
        left: node.x,
        padding: '10px 14px',
        background: deleteMode ? '#fee2e2' : '#ffffff', // Red background in delete mode
        color: deleteMode ? '#dc2626' : '#1a1a1a', // Red text in delete mode
        border: `2px solid ${isStartNode ? '#ec4899' : deleteMode ? '#ef4444' : '#4a90e2'}`,
        borderRadius: '8px',
        fontWeight: 500,
        fontSize: '14px',
        minWidth: '100px',
        maxWidth: '160px',
        textAlign: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        cursor: deleteMode ? 'pointer' : 'move',
        userSelect: 'none',
        zIndex: 2,
        // Highlight start node during connection
        ...(isStartNode && {
          boxShadow: '0 0 15px rgba(236, 72, 153, 0.5)'
        })
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      onClick={(e) => {
        if (deleteMode) {
          e.stopPropagation();
          onDotClick(node.id); // This will delete the node
        }
      }}
    >
      {isEditing ? (
        <input
          type="text"
          value={text}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            padding: '2px 0',
            fontSize: '14px',
            border: '1px solid #aaa',
            borderRadius: '4px',
            outline: '2px solid #4a90e2',
            textAlign: 'center',
            boxSizing: 'border-box',
          }}
        />
      ) : (
        <span>{text}</span>
      )}

      {/* Connection Trigger Dot */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          right: '-8px',
          width: '12px',
          height: '12px',
          backgroundColor: isStartNode 
            ? '#ec4899' // Red for start node
            : isConnecting 
              ? '#fbbf24' // Yellow for other nodes during connection
              : deleteMode
                ? '#ef4444' // Red in delete mode
                : '#4a90e2', // Blue normal state
          borderRadius: '50%',
          transform: 'translateY(-50%)',
          cursor: 'pointer',
          border: '2px solid white',
          boxShadow: '0 0 6px rgba(0,0,0,0.3)',
          transition: 'background-color 0.2s ease, transform 0.1s ease',
        }}
        onClick={(e) => {
          e.stopPropagation(); // Prevent drag
          onDotClick(node.id);
        }}
        title={deleteMode 
          ? "Click to delete node" 
          : isConnecting 
            ? "Click to connect" 
            : "Click to start connection"
        }
        onMouseDown={(e) => {
          if (!deleteMode) {
            e.stopPropagation(); // Prevent drag initiation
          }
        }}
      />
    </div>
  );
}