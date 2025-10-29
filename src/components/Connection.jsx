import React, { useState, useRef, useEffect } from "react";

const Connection = ({ 
  id,
  from, 
  to, 
  selected,
  labels = [],
  onClick,
  onDelete,
  onAddLabel,
  onUpdateLabel,
  onUpdateLabelPosition,
  onDeleteLabel
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Curve calculation
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const curveOffset = 50;
  
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  
  const offsetX = (-dy / distance) * curveOffset;
  const offsetY = (dx / distance) * curveOffset;
  
  const controlX = midX + offsetX;
  const controlY = midY + offsetY;
  
  const path = `M ${from.x} ${from.y} Q ${controlX} ${controlY} ${to.x} ${to.y}`;

  // Dot position on curve
  const t = 0.5;
  const dotX = (1 - t) * (1 - t) * from.x + 2 * (1 - t) * t * controlX + t * t * to.x;
  const dotY = (1 - t) * (1 - t) * from.y + 2 * (1 - t) * t * controlY + t * t * to.y;

  const handleDotClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onClick(id);
  };

  const handleDeleteConnection = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Delete this connection and all its labels?')) {
      onDelete(id);
    }
  };

  const handleAddLabel = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onAddLabel(id);
  };

  return (
    <g className={`connection-group ${selected ? 'selected' : ''}`}>
      {/* Invisible thick path for hover detection */}
      <path
        d={path}
        stroke="transparent"
        strokeWidth="25"
        fill="none"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ 
          cursor: 'pointer',
          pointerEvents: 'stroke'
        }}
      />
      
      {/* Visible connection line */}
      <path
        d={path}
        stroke={selected ? "#007bff" : isHovered ? "#333" : "#666"}
        strokeWidth={selected ? "3" : isHovered ? "2.5" : "2"}
        fill="none"
        opacity={selected ? "1" : isHovered ? "0.8" : "0.6"}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ 
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          pointerEvents: 'stroke'
        }}
      />

      {/* Center dot */}
      {(isHovered || selected) && (
        <circle
          cx={dotX}
          cy={dotY}
          r="9"
          fill={selected ? "#007bff" : "#ffffff"}
          stroke={selected ? "#0056b3" : "#333"}
          strokeWidth="2.5"
          onClick={handleDotClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{ 
            cursor: 'pointer',
            filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.3))',
            pointerEvents: 'all'
          }}
        />
      )}

      {/* Add label button - LEFT SIDE */}
      {selected && (
        <g 
          onClick={handleAddLabel}
          onMouseEnter={() => setIsHovered(true)}
          style={{ cursor: 'pointer' }}
        >
          <circle
            cx={dotX - 50}
            cy={dotY}
            r="16"
            fill="#28a745"
            stroke="white"
            strokeWidth="2.5"
            style={{ 
              filter: 'drop-shadow(0 2px 5px rgba(40,167,69,0.5))',
              pointerEvents: 'all'
            }}
          />
          <text
            x={dotX - 50}
            y={dotY + 6}
            textAnchor="middle"
            fill="white"
            fontSize="20"
            fontWeight="bold"
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >
            ➕
          </text>
        </g>
      )}

      {/* Delete connection button - RIGHT SIDE */}
      {selected && (
        <g 
          onClick={handleDeleteConnection}
          onMouseEnter={() => setIsHovered(true)}
          style={{ cursor: 'pointer' }}
        >
          <circle
            cx={dotX + 50}
            cy={dotY}
            r="16"
            fill="#dc3545"
            stroke="white"
            strokeWidth="2.5"
            style={{ 
              filter: 'drop-shadow(0 2px 5px rgba(220,53,69,0.5))',
              pointerEvents: 'all'
            }}
          />
          <text
            x={dotX + 50}
            y={dotY + 5}
            textAnchor="middle"
            fill="white"
            fontSize="18"
            fontWeight="bold"
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >
            🗑
          </text>
        </g>
      )}

      {/* Render all labels */}
      {labels.map((label, index) => (
        <Label
          key={label.id}
          label={label}
          dotX={dotX}
          dotY={dotY}
          index={index}
          onUpdateLabel={(newText) => onUpdateLabel(id, label.id, newText)}
          onUpdatePosition={(offsetX, offsetY) => onUpdateLabelPosition(id, label.id, offsetX, offsetY)}
          onDelete={() => onDeleteLabel(id, label.id)}
          onMouseEnter={() => setIsHovered(true)}
        />
      ))}

      {/* Hint tooltip */}
      {isHovered && !selected && labels.length === 0 && (
        <g style={{ pointerEvents: 'none' }}>
          <rect
            x={dotX - 50}
            y={dotY + 15}
            width="100"
            height="18"
            fill="rgba(0,0,0,0.8)"
            rx="4"
          />
          <text
            x={dotX}
            y={dotY + 27}
            textAnchor="middle"
            fill="white"
            fontSize="11"
            fontWeight="500"
            style={{ userSelect: 'none' }}
          >
            Click to select
          </text>
        </g>
      )}
    </g>
  );
};

// FIXED: Individual Label Component with cleanup
const Label = ({ 
  label, 
  dotX, 
  dotY, 
  index,
  onUpdateLabel,
  onUpdatePosition,
  onDelete,
  onMouseEnter
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(!label.text);
  const [editText, setEditText] = useState(label.text);

  const labelX = dotX + (label.offsetX || 0);
  const labelY = dotY + 40 + (label.offsetY || 0);

  useEffect(() => {
    if (!label.text) {
      setIsEditing(true);
    }
  }, [label.text]);

  const handleMouseDown = (e) => {
    if (isEditing) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragging(true);

    const startX = e.clientX;
    const startY = e.clientY;
    const startOffsetX = label.offsetX || 0;
    const startOffsetY = label.offsetY || 0;

    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      
      onUpdatePosition(startOffsetX + deltaX, startOffsetY + deltaY);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleDoubleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditing(true);
    setEditText(label.text);
  };

  const handleBlur = () => {
    setIsEditing(false);
    onUpdateLabel(editText);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleBlur();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setEditText(label.text);
      setIsEditing(false);
    }
  };

  const handleDeleteLabel = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete();
  };

  if (isEditing) {
    return (
      <foreignObject
        x={labelX - 80}
        y={labelY - 20}
        width="160"
        height="40"
        onMouseEnter={onMouseEnter}
      >
        <div style={{ 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%'
        }}>
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            autoFocus
            placeholder="Add label..."
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '2px solid #007bff',
              borderRadius: '6px',
              fontSize: '14px',
              outline: 'none',
              textAlign: 'center',
              boxShadow: '0 3px 10px rgba(0,123,255,0.3)',
              backgroundColor: 'white',
              fontWeight: '500',
              color: '#333',
            }}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          />
        </div>
      </foreignObject>
    );
  }

  if (!label.text) {
    return null;
  }

  const textLength = label.text.length;
  const boxWidth = Math.max(textLength * 8 + 40, 80);

  return (
    <g onMouseEnter={onMouseEnter}>
      <rect
        x={labelX - boxWidth / 2}
        y={labelY - 12}
        width={boxWidth}
        height={24}
        fill="white"
        stroke={isDragging ? "#007bff" : "#aaa"}
        strokeWidth={isDragging ? "2" : "1.5"}
        rx="5"
        opacity="0.98"
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        style={{ 
          filter: isDragging 
            ? 'drop-shadow(0 4px 8px rgba(0,123,255,0.4))' 
            : 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))',
          pointerEvents: 'all',
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
      />
      
      <text
        x={labelX}
        y={labelY + 4}
        textAnchor="middle"
        fill="#333"
        fontSize="14"
        fontWeight="500"
        onDoubleClick={handleDoubleClick}
        style={{ 
          pointerEvents: 'none',
          userSelect: 'none'
        }}
      >
        {label.text}
      </text>
      
      <g onClick={handleDeleteLabel} style={{ cursor: 'pointer' }}>
        <circle
          cx={labelX + boxWidth / 2 - 10}
          cy={labelY}
          r="9"
          fill="#dc3545"
          stroke="white"
          strokeWidth="1.5"
          style={{ 
            pointerEvents: 'all',
            filter: 'drop-shadow(0 1px 3px rgba(220,53,69,0.4))'
          }}
        />
        <text
          x={labelX + boxWidth / 2 - 10}
          y={labelY + 4}
          textAnchor="middle"
          fill="white"
          fontSize="11"
          fontWeight="bold"
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          ✕
        </text>
      </g>
    </g>
  );
};

export default Connection;