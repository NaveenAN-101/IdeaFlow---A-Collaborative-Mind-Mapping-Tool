// App.jsx
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Node from './components/Node';

function App() {
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [startNode, setStartNode] = useState(null);
  const [deleteMode, setDeleteMode] = useState(false);

  const addNode = () => {
    const x = 200 + Math.random() * 400;
    const y = 200 + Math.random() * 300;

    const newNode = {
      id: uuidv4(),
      text: 'New Idea',
      x,
      y,
    };
    setNodes((prev) => [...prev, newNode]);
  };

  const deleteNode = (nodeId) => {
    // Remove the node
    setNodes((prev) => prev.filter((node) => node.id !== nodeId));
    // Remove all connections involving this node
    setConnections((prev) => 
      prev.filter((conn) => conn.from !== nodeId && conn.to !== nodeId)
    );
    // Exit connection mode if needed
    if (startNode === nodeId) {
      exitConnectionMode();
    }
  };

  const updateNodePosition = (id, x, y) => {
    setNodes((prev) =>
      prev.map((node) => (node.id === id ? { ...node, x, y } : node))
    );
  };

  const updateNodeText = (id, text) => {
    setNodes((prev) =>
      prev.map((node) => (node.id === id ? { ...node, text } : node))
    );
  };

  const handleNodeClickForConnection = (nodeId) => {
    if (deleteMode) {
      // Delete mode: delete the node
      deleteNode(nodeId);
      return;
    }
    
    if (isConnecting) {
      // If we're already connecting, connect to this node
      if (startNode && startNode !== nodeId) {
        // Prevent duplicate connections
        const exists = connections.some(
          (conn) => conn.from === startNode && conn.to === nodeId
        );
        if (!exists) {
          setConnections((prev) => [
            ...prev,
            { from: startNode, to: nodeId },
          ]);
        }
      }
      // Exit connection mode
      exitConnectionMode();
    } else {
      // Start connection mode
      setStartNode(nodeId);
      setIsConnecting(true);
    }
  };

  const deleteConnection = (fromId, toId) => {
    setConnections((prev) => 
      prev.filter(conn => !(conn.from === fromId && conn.to === toId))
    );
  };

  const exitConnectionMode = () => {
    setIsConnecting(false);
    setStartNode(null);
  };

  const toggleDeleteMode = () => {
    setDeleteMode(!deleteMode);
    exitConnectionMode(); // Exit connection mode if active
  };

  // Exit connection mode when clicking on empty space
  const handleCanvasClick = () => {
    if (isConnecting) {
      exitConnectionMode();
    }
  };

  const renderConnections = () => {
    return connections.map((conn, index) => {
      const fromNode = nodes.find((n) => n.id === conn.from);
      const toNode = nodes.find((n) => n.id === conn.to);
      if (!fromNode || !toNode) return null;

      // Calculate center points of nodes
      const fromX = fromNode.x + 80;
      const fromY = fromNode.y + 30;
      const toX = toNode.x + 80;
      const toY = toNode.y + 30;

      // Bezier curve control points
      const dx = (toX - fromX) * 0.6;

      const pathData = `
        M ${fromX} ${fromY}
        C ${fromX + dx} ${fromY},
          ${toX - dx} ${toY},
          ${toX} ${toY}
      `;

      return (
        <g key={index}>
          <path
            d={pathData}
            fill="none"
            stroke="#9ca3af"
            strokeWidth="2"
            markerEnd="url(#arrowhead)"
            style={{ pointerEvents: 'stroke', cursor: deleteMode ? 'pointer' : 'default' }}
            onClick={(e) => {
              if (deleteMode) {
                e.stopPropagation();
                deleteConnection(conn.from, conn.to);
              }
            }}
          />
          {deleteMode && (
            <circle
              cx={(fromX + toX) / 2}
              cy={(fromY + toY) / 2}
              r="8"
              fill="#ef4444"
              stroke="white"
              strokeWidth="2"
              cursor="pointer"
              onClick={(e) => {
                e.stopPropagation();
                deleteConnection(conn.from, conn.to);
              }}
            />
          )}
        </g>
      );
    });
  };

  return (
    <div>
      <button
        onClick={addNode}
        style={{
          margin: '10px',
          padding: '8px 16px',
          fontSize: '14px',
          backgroundColor: '#4a90e2',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: 500,
        }}
      >
        ➕ Add Node
      </button>

      <button
        onClick={toggleDeleteMode}
        style={{
          margin: '10px',
          padding: '8px 16px',
          fontSize: '14px',
          backgroundColor: deleteMode ? '#ef4444' : '#6b7280',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: 500,
        }}
      >
        {deleteMode ? '❌ Delete Mode ON' : '🗑️ Delete Mode'}
      </button>

      {/* Connection Status Indicator */}
      {isConnecting && (
        <span style={{
          marginLeft: '10px',
          fontSize: '14px',
          color: '#ec4899',
          fontWeight: 'bold'
        }}>
          🔗 Connecting from node {startNode?.slice(0, 5)}... Click another node's dot
        </span>
      )}

      {deleteMode && (
        <span style={{
          marginLeft: '10px',
          fontSize: '14px',
          color: '#ef4444',
          fontWeight: 'bold'
        }}>
          🗑️ Delete Mode: Click nodes or connections to delete
        </span>
      )}

      <div
        style={{
          position: 'relative',
          width: '100vw',
          height: '90vh',
          backgroundColor: '#1e1e2e',
          overflow: 'hidden',
          touchAction: 'none',
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
        }}
        onClick={handleCanvasClick}
      >
        {/* SVG Layer for Connections */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 1,
          }}
        >
          <defs>
            {/* Reliable Arrowhead Marker */}
            <marker
              id="arrowhead"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
              fill="#9ca3af"
            >
              <path d="M 0 0 L 10 5 L 0 10 Z" />
            </marker>
          </defs>
          {renderConnections()}
        </svg>

        {/* Nodes Layer */}
        {nodes.map((node) => (
          <div
            key={node.id}
            style={{ position: 'absolute', zIndex: 2 }}
          >
            <Node
              node={node}
              onDrag={updateNodePosition}
              onTextChange={updateNodeText}
              onDotClick={handleNodeClickForConnection}
              isConnecting={isConnecting}
              isStartNode={isConnecting && startNode === node.id}
              deleteMode={deleteMode}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;