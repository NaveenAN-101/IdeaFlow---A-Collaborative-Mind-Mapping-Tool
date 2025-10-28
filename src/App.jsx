import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Node from "./components/Node";
import Connection from "./components/Connection";
import Toolbar from "./components/Toolbar";
import StylePanel from "./components/StylePanel";
import socket from "./socket";
import "./App.css";

function App() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [connectingFrom, setConnectingFrom] = useState(null);
  const [stylePanelNode, setStylePanelNode] = useState(null);
  
  // Pan/Zoom state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  
  const boardRef = useRef(null);
  const canvasRef = useRef(null);
  const currentSessionId = sessionId || "default-session";

  // Generate unique session ID
  const createNewSession = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    navigate(`/session/${newId}`);
  };

  // ESC key handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setSelectedNode(null);
        setSelectedConnection(null);
        setConnectingFrom(null);
        setIsPanning(false);
        setStylePanelNode(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Zoom with mouse wheel
  useEffect(() => {
    const handleWheel = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        const newZoom = Math.min(Math.max(zoom * delta, 0.1), 3);
        
        setZoom(newZoom);
      }
    };

    const board = boardRef.current;
    if (board) {
      board.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (board) {
        board.removeEventListener('wheel', handleWheel);
      }
    };
  }, [zoom]);

  // Pan handlers
  const handleMouseDown = (e) => {
    if (e.target === canvasRef.current || e.target === boardRef.current) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Reset view
  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Zoom in/out buttons
  const zoomIn = () => setZoom(Math.min(zoom * 1.2, 3));
  const zoomOut = () => setZoom(Math.max(zoom * 0.8, 0.1));

  // Load session data on mount
  useEffect(() => {
    if (!sessionId) {
      createNewSession();
      return;
    }

    socket.emit("join-session", currentSessionId);

    fetch(`http://localhost:4000/api/session/${currentSessionId}`)
      .then((res) => res.json())
      .then((data) => {
        setNodes(data.nodes || []);
        setConnections(data.connections || []);
      })
      .catch((err) => console.error("Error loading session:", err));

    socket.on("session-data", (data) => {
      setNodes(data.nodes || []);
      setConnections(data.connections || []);
    });

    socket.on("board-updated", (data) => {
      setNodes(data.nodes || []);
      setConnections(data.connections || []);
    });

    return () => {
      socket.off("session-data");
      socket.off("board-updated");
    };
  }, [sessionId]);

  // Sync changes to server (debounced)
  const syncTimeoutRef = useRef(null);
  const syncToServer = (updatedNodes, updatedConnections) => {
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(() => {
      socket.emit("update-board", {
        sessionId: currentSessionId,
        nodes: updatedNodes,
        connections: updatedConnections,
      });
    }, 50);
  };

  // Add new node with all properties
  const addNode = () => {
    const newNode = {
      id: `node-${Date.now()}`,
      x: 100 + Math.random() * 300,
      y: 100 + Math.random() * 200,
      content: "New Idea",
      color: "#007bff",
      shape: "rectangle",
      size: "medium",
      borderStyle: "solid",
      fontSize: "medium",
    };
    const updated = [...nodes, newNode];
    setNodes(updated);
    syncToServer(updated, connections);
  };

  // Delete node
  const deleteNode = (id) => {
    const updatedNodes = nodes.filter((n) => n.id !== id);
    const updatedConnections = connections.filter(
      (c) => c.from !== id && c.to !== id
    );
    setNodes(updatedNodes);
    setConnections(updatedConnections);
    syncToServer(updatedNodes, updatedConnections);
    setSelectedNode(null);
  };

  // Edit node content
  const editNode = (id, newContent) => {
    const updated = nodes.map((n) =>
      n.id === id ? { ...n, content: newContent } : n
    );
    setNodes(updated);
    syncToServer(updated, connections);
  };

  // Handle style panel updates
  const handleStyleUpdate = (nodeId, property, value) => {
    if (property === "delete") {
      deleteNode(nodeId);
      return;
    }

    const updated = nodes.map((n) =>
      n.id === nodeId ? { ...n, [property]: value } : n
    );
    setNodes(updated);
    syncToServer(updated, connections);
    
    // Update panel preview
    const updatedNode = updated.find((n) => n.id === nodeId);
    if (updatedNode) {
      setStylePanelNode(updatedNode);
    }
  };

  // Move node
  const moveNode = (id, deltaX, deltaY) => {
    setNodes((prevNodes) => {
      const updated = prevNodes.map((n) =>
        n.id === id ? { ...n, x: n.x + deltaX / zoom, y: n.y + deltaY / zoom } : n
      );
      syncToServer(updated, connections);
      return updated;
    });
  };

  // Create connection
  const createConnection = (fromId, toId) => {
    if (fromId === toId) {
      alert("Cannot connect a node to itself!");
      setConnectingFrom(null);
      return;
    }

    const exists = connections.find(
      (c) =>
        (c.from === fromId && c.to === toId) ||
        (c.from === toId && c.to === fromId)
    );

    if (exists) {
      alert("Connection already exists!");
      setConnectingFrom(null);
      return;
    }

    const newConnection = { 
      id: `conn-${Date.now()}`, 
      from: fromId, 
      to: toId,
      labels: []
    };
    const updated = [...connections, newConnection];
    setConnections(updated);
    syncToServer(nodes, updated);
    setConnectingFrom(null);
  };

  // Delete connection
  const deleteConnection = (id) => {
    const updated = connections.filter((c) => c.id !== id);
    setConnections(updated);
    syncToServer(nodes, updated);
    setSelectedConnection(null);
  };

  // Add label to connection
  const addConnectionLabel = (connectionId) => {
    const updated = connections.map((c) =>
      c.id === connectionId
        ? {
            ...c,
            labels: [
              ...(c.labels || []),
              {
                id: `label-${Date.now()}`,
                text: "",
                offsetX: 0,
                offsetY: (c.labels?.length || 0) * 30,
              },
            ],
          }
        : c
    );
    setConnections(updated);
    syncToServer(nodes, updated);
  };

  // Update specific label text
  const updateConnectionLabel = (connectionId, labelId, newText) => {
    const updated = connections.map((c) =>
      c.id === connectionId
        ? {
            ...c,
            labels: c.labels.map((label) =>
              label.id === labelId ? { ...label, text: newText } : label
            ),
          }
        : c
    );
    setConnections(updated);
    syncToServer(nodes, updated);
  };

  // Update label position (for dragging)
  const updateLabelPosition = (connectionId, labelId, offsetX, offsetY) => {
    const updated = connections.map((c) =>
      c.id === connectionId
        ? {
            ...c,
            labels: c.labels.map((label) =>
              label.id === labelId ? { ...label, offsetX, offsetY } : label
            ),
          }
        : c
    );
    setConnections(updated);
    syncToServer(nodes, updated);
  };

  // Delete specific label
  const deleteConnectionLabel = (connectionId, labelId) => {
    const updated = connections.map((c) =>
      c.id === connectionId
        ? {
            ...c,
            labels: c.labels.filter((label) => label.id !== labelId),
          }
        : c
    );
    setConnections(updated);
    syncToServer(nodes, updated);
  };

  // Handle connection click
  const handleConnectionClick = (connectionId) => {
    setSelectedConnection(connectionId);
    setSelectedNode(null);
  };

  // Handle node selection
  const handleNodeSelect = (nodeId, event) => {
    event.stopPropagation();

    if (connectingFrom) {
      createConnection(connectingFrom, nodeId);
    } else {
      setSelectedNode(nodeId);
      setSelectedConnection(null);
      // Open style panel
      const node = nodes.find((n) => n.id === nodeId);
      if (node) {
        setStylePanelNode(node);
      }
    }
  };

  // Handle board click (deselect)
  const handleBoardClick = () => {
    if (!isPanning) {
      setSelectedNode(null);
      setSelectedConnection(null);
      if (connectingFrom) {
        setConnectingFrom(null);
      }
    }
  };

  // Start connection mode from selected node
  const startConnectionMode = () => {
    if (!selectedNode) {
      alert("Please click a node to select it first, then click Connect!");
      return;
    }

    setConnectingFrom(selectedNode);
  };

  // Export as JSON
  const exportJSON = () => {
    const data = { nodes, connections };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ideaflow-${currentSessionId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export as Image
  const exportImage = async () => {
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(boardRef.current, {
        backgroundColor: "#f8f9fa",
        scale: 2,
      });
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `ideaflow-${currentSessionId}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export image. Make sure html2canvas is installed.");
    }
  };

  return (
    <div className="App">
      <Toolbar
        onAddNode={addNode}
        onExportJSON={exportJSON}
        onExportImage={exportImage}
        onToggleConnect={startConnectionMode}
        connectMode={!!connectingFrom}
        sessionId={currentSessionId}
        onNewSession={createNewSession}
        zoom={zoom}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onResetView={resetView}
      />

      <div 
        className="board" 
        ref={boardRef} 
        onClick={handleBoardClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ cursor: isPanning ? 'grabbing' : 'default' }}
      >
        {/* Canvas with pan/zoom transform */}
        <div
          ref={canvasRef}
          className="canvas"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
          }}
        >
          {/* SVG for connections */}
          <svg className="connections-layer">
            {connections.map((conn) => {
              const fromNode = nodes.find((n) => n.id === conn.from);
              const toNode = nodes.find((n) => n.id === conn.to);
              if (!fromNode || !toNode) return null;

              const fromX = fromNode.x + 75;
              const fromY = fromNode.y + 40;
              const toX = toNode.x + 75;
              const toY = toNode.y + 40;

              return (
                <Connection
                  key={conn.id}
                  id={conn.id}
                  from={{ x: fromX, y: fromY }}
                  to={{ x: toX, y: toY }}
                  labels={conn.labels || []}
                  selected={selectedConnection === conn.id}
                  onClick={handleConnectionClick}
                  onDelete={deleteConnection}
                  onAddLabel={addConnectionLabel}
                  onUpdateLabel={updateConnectionLabel}
                  onUpdateLabelPosition={updateLabelPosition}
                  onDeleteLabel={deleteConnectionLabel}
                />
              );
            })}
          </svg>

          {/* Render nodes */}
          {nodes.map((node) => (
            <Node
              key={node.id}
              {...node}
              selected={selectedNode === node.id}
              connecting={connectingFrom === node.id}
              onMove={moveNode}
              onEdit={editNode}
              onSelect={handleNodeSelect}
            />
          ))}
        </div>

        {/* Zoom controls overlay */}
        <div className="zoom-controls">
          <button onClick={zoomIn} title="Zoom In">➕</button>
          <div className="zoom-display">{Math.round(zoom * 100)}%</div>
          <button onClick={zoomOut} title="Zoom Out">➖</button>
          <button onClick={resetView} title="Reset View">⟲</button>
        </div>

        {/* Connection hint */}
        {connectingFrom && (
          <div className="connect-hint">
            🔗 Click another node to create a connection
            <br />
            <small>Press ESC or click the board to cancel</small>
          </div>
        )}

        {/* Selection hint */}
        {selectedNode && !connectingFrom && !stylePanelNode && (
          <div className="selection-hint">
            ✨ Node selected! Double-click to edit text
            <br />
            <small>Style panel opened • Press ESC to close</small>
          </div>
        )}

        {/* Connection selection hint */}
        {selectedConnection && (
          <div className="selection-hint">
            🔗 Connection selected! Click ➕ to add labels
            <br />
            <small>Double-click labels to edit • Drag to move • Click ✕ to delete</small>
          </div>
        )}

        {/* Welcome hint */}
        {nodes.length === 0 && (
          <div className="welcome-hint">
            <h2>👋 Welcome to IdeaFlow!</h2>
            <p>Click "Add Node" to start your mind map</p>
            <div className="quick-tips">
              <div className="tip">🖱️ Drag to move nodes</div>
              <div className="tip">🎯 Click to select & customize</div>
              <div className="tip">✏️ Double-click to edit</div>
              <div className="tip">🔗 Select → Connect → Click target</div>
              <div className="tip">🔍 Ctrl+Scroll to zoom</div>
              <div className="tip">✋ Drag background to pan</div>
            </div>
          </div>
        )}
      </div>

      {/* Style Panel */}
      <StylePanel
        node={stylePanelNode}
        onClose={() => setStylePanelNode(null)}
        onUpdate={handleStyleUpdate}
      />
    </div>
  );
}

export default App;