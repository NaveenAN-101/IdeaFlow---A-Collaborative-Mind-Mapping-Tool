// src/components/StylePanel.jsx

import React from "react";

const StylePanel = ({ node, onClose, onUpdate }) => {
  if (!node) return null;

  const colors = ["#007bff", "#28a745", "#ffc107", "#dc3545", "#6f42c1", "#17a2b8"];
  const shapes = ["rectangle", "circle", "diamond", "hexagon", "star", "cloud"];
  const sizes = ["small", "medium", "large"];
  const borderStyles = ["solid", "dashed", "dotted"];
  const fontSizes = ["small", "medium", "large"];

  const handleChange = (property, value) => {
    onUpdate(node.id, property, value);
  };

  return (
    <div className="style-panel-horizontal">
      {/* Moved close button outside the inner flex container */}
      <button className="panel-close-btn" onClick={onClose} title="Close (ESC)">
        ✕
      </button>

      <div className="style-panel-inner">
        {/* All sections are now inside this flex container */}
        
        {/* Color */}
        <div className="panel-section">
          <div className="section-title">🎨 Color</div>
          <div className="panel-options-row">
            {colors.map((c) => (
              <div
                key={c}
                className={`color-dot ${node.color === c ? "active" : ""}`}
                style={{ background: c }}
                onClick={() => handleChange("color", c)}
                title={c}
              />
            ))}
          </div>
        </div>

        {/* Shape */}
        <div className="panel-section">
          <div className="section-title">◆ Shape</div>
          <div className="panel-options-row">
            {shapes.map((s) => (
              <button
                key={s}
                className={`panel-btn ${node.shape === s ? "active" : ""}`}
                onClick={() => handleChange("shape", s)}
                title={s}
              >
                {s === "rectangle" && "▭"}
                {s === "circle" && "●"}
                {s === "diamond" && "◆"}
                {s === "hexagon" && "⬡"}
                {s === "star" && "★"}
                {s === "cloud" && "☁"}
              </button>
            ))}
          </div>
        </div>

        {/* Size */}
        <div className="panel-section">
          <div className="section-title">📏 Size</div>
          <div className="panel-options-row">
            {sizes.map((s) => (
              <button
                key={s}
                className={`panel-btn ${node.size === s ? "active" : ""}`}
                onClick={() => handleChange("size", s)}
              >
                {s.charAt(0).toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Border */}
        <div className="panel-section">
          <div className="section-title">━ Border</div>
          <div className="panel-options-row">
            {borderStyles.map((bs) => (
              <button
                key={bs}
                className={`panel-btn ${node.borderStyle === bs ? "active" : ""}`}
                onClick={() => handleChange("borderStyle", bs)}
                title={bs}
              >
                {bs === "solid" && "━"}
                {bs === "dashed" && "╍"}
                {bs === "dotted" && "┅"}
              </button>
            ))}
          </div>
        </div>

        {/* Font */}
        <div className="panel-section">
          <div className="section-title">A Font</div>
          <div className="panel-options-row">
            {fontSizes.map((f) => (
              <button
                key={f}
                className={`panel-btn ${node.fontSize === f ? "active" : ""}`}
                onClick={() => handleChange("fontSize", f)}
                style={{ fontSize: f === "small" ? "11px" : f === "large" ? "16px" : "13px" }}
              >
                A
              </button>
            ))}
          </div>
        </div>

        {/* Delete */}
        <div className="panel-section delete-section">
          <button
            className="panel-delete-btn"
            onClick={() => {
              if (window.confirm("Delete this node?")) {
                onUpdate(node.id, "delete", null);
                onClose();
              }
            }}
          >
            🗑️ Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default StylePanel;