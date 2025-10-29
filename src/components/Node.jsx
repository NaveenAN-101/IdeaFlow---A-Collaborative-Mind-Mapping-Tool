import React, { useState, useRef, useEffect } from "react";

const Node = ({
  id,
  x,
  y,
  content,
  color = "#007bff",
  shape = "rectangle",
  size = "medium",
  borderStyle = "solid",
  fontSize = "medium",
  selected,
  connecting,
  onMove,
  onEdit,
  onSelect,
}) => {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(content);
  const nodeRef = useRef(null);
  const dragStateRef = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
    hasMoved: false,
  });
  const clickTimeoutRef = useRef(null);

  useEffect(() => {
    setText(content);
  }, [content]);

  // Size configurations
  const sizes = {
    small: { width: 120, height: 60 },
    medium: { width: 150, height: 80 },
    large: { width: 200, height: 100 },
  };

  const currentSize = sizes[size];

  // Font size configurations
  const fontSizes = {
    small: "12px",
    medium: "14px",
    large: "18px",
  };

  // FIXED: Get border color and width for all shapes
  const getBorderInfo = () => {
    const borderWidth = selected ? "3px" : connecting ? "3px" : "2px";
    const borderColor = selected ? "#000" : connecting ? "#FFD700" : "#fff";
    return { borderWidth, borderColor };
  };

  // FIXED: Get shape-specific styles with proper border handling
  const getShapeStyles = () => {
    const { borderWidth, borderColor } = getBorderInfo();
    const baseShadow = connecting
      ? "0 0 20px rgba(255, 215, 0, 0.8)"
      : selected
      ? "0 6px 20px rgba(0,0,0,0.3)"
      : "0 4px 12px rgba(0,0,0,0.15)";

    const baseStyles = {
      position: "absolute",
      left: x,
      top: y,
      width: currentSize.width,
      height: currentSize.height,
      background: color,
      color: "#fff",
      fontWeight: "500",
      fontSize: fontSizes[fontSize],
      userSelect: "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      cursor: dragStateRef.current.isDragging ? "grabbing" : "grab",
      transition: dragStateRef.current.isDragging ? "none" : "all 0.2s ease",
      zIndex: dragStateRef.current.isDragging ? 1000 : selected ? 300 : 200,
    };

    switch (shape) {
      case "circle":
        const circleSize = Math.max(currentSize.width, currentSize.height);
        return {
          ...baseStyles,
          width: circleSize,
          height: circleSize,
          borderRadius: "50%",
          border: `${borderWidth} ${borderStyle} ${borderColor}`,
          boxShadow: baseShadow,
        };

      case "diamond":
        const diamondSize = Math.max(currentSize.width, currentSize.height);
        return {
          ...baseStyles,
          width: diamondSize,
          height: diamondSize,
          borderRadius: "8px",
          border: `${borderWidth} ${borderStyle} ${borderColor}`,
          boxShadow: baseShadow,
          transform: "rotate(45deg)",
        };

      case "hexagon":
        // FIXED: Use drop-shadow for border effect on clipped shapes
        const hexBorderSize = parseInt(borderWidth);
        const hexBorderColor = borderColor;
        return {
          ...baseStyles,
          clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
          border: "none",
          filter: `drop-shadow(0 0 0 ${hexBorderSize}px ${hexBorderColor}) drop-shadow(0 4px 8px rgba(0,0,0,0.2))`,
        };

      case "star":
        // FIXED: Use drop-shadow for border effect on clipped shapes
        const starSize = Math.max(currentSize.width, currentSize.height) * 1.2;
        const starBorderSize = parseInt(borderWidth);
        const starBorderColor = borderColor;
        return {
          ...baseStyles,
          width: starSize,
          height: starSize,
          clipPath: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
          border: "none",
          filter: `drop-shadow(0 0 0 ${starBorderSize}px ${starBorderColor}) drop-shadow(0 4px 8px rgba(0,0,0,0.2))`,
        };

      case "cloud":
        return {
          ...baseStyles,
          borderRadius: "100px",
          border: `${borderWidth} ${borderStyle} ${borderColor}`,
          boxShadow: baseShadow,
          position: "relative",
        };

      case "rectangle":
      default:
        return {
          ...baseStyles,
          borderRadius: "12px",
          border: `${borderWidth} ${borderStyle} ${borderColor}`,
          boxShadow: baseShadow,
        };
    }
  };

  const handleMouseDown = (e) => {
    if (editing) return;
    if (e.button !== 0) return;
    
    e.stopPropagation();

    dragStateRef.current = {
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      hasMoved: false,
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (!dragStateRef.current.isDragging) return;

    const deltaX = e.clientX - dragStateRef.current.startX;
    const deltaY = e.clientY - dragStateRef.current.startY;

    if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
      dragStateRef.current.hasMoved = true;
      onMove(id, deltaX, deltaY);
      dragStateRef.current.startX = e.clientX;
      dragStateRef.current.startY = e.clientY;
    }
  };

  const handleMouseUp = (e) => {
    const wasDragging = dragStateRef.current.hasMoved;

    dragStateRef.current.isDragging = false;
    dragStateRef.current.hasMoved = false;

    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);

    if (!wasDragging) {
      handleClick(e);
    }
  };

  const handleClick = (e) => {
    e.stopPropagation();

    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }

    clickTimeoutRef.current = setTimeout(() => {
      onSelect(id, e);
    }, 200);
  };

  const handleDoubleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
    }

    setEditing(true);
  };

  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, []);

  const handleBlur = () => {
    setEditing(false);
    if (text.trim() !== content) {
      onEdit(id, text.trim() || "Empty");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleBlur();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setText(content);
      setEditing(false);
    }
  };

  const isCloud = shape === "cloud";

  return (
    <div
      ref={nodeRef}
      className={`node ${selected ? "selected" : ""} ${connecting ? "connecting" : ""}`}
      style={getShapeStyles()}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
    >
      {/* Cloud bubbles effect */}
      {isCloud && (
        <>
          <div
            style={{
              position: "absolute",
              width: "60%",
              height: "60%",
              background: color,
              borderRadius: "50%",
              top: "-25%",
              left: "10%",
              zIndex: -1
            }}
          />
          <div
            style={{
              position: "absolute",
              width: "50%",
              height: "50%",
              background: color,
              borderRadius: "50%",
              top: "-20%",
              right: "15%",
              zIndex: -1
            }}
          />
        </>
      )}

      <div
        style={{
          transform: shape === "diamond" 
            ? `rotate(-45deg) scale(${selected ? 1.08 : 1})` 
            : "none",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "10px",
          zIndex: 1,
          position: "relative",
          transition: "transform 0.2s ease",
        }}
      >
        {editing ? (
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            autoFocus
            style={{
              background: "rgba(255, 255, 255, 0.2)",
              border: "1px solid rgba(255, 255, 255, 0.5)",
              borderRadius: "4px",
              color: "#fff",
              fontSize: fontSizes[fontSize],
              outline: "none",
              width: "90%",
              padding: "4px 8px",
              textAlign: "center",
            }}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          />
        ) : (
          <span 
            style={{ 
              pointerEvents: "none", 
              wordBreak: "break-word",
              textShadow: "0 1px 3px rgba(0,0,0,0.3)",
              fontWeight: "600"
            }}
          >
            {content}
          </span>
        )}
      </div>
    </div>
  );
};

export default Node;