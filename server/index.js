import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import mongoose from "mongoose";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

// MongoDB Connection (Optional - uncomment when ready)
// mongoose.connect('mongodb://localhost:27017/ideaflow', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// });

// Session Schema (for persistence)
const sessionSchema = new mongoose.Schema({
  sessionId: { type: String, unique: true, required: true },
  nodes: { type: Array, default: [] },
  connections: { type: Array, default: [] },
  lastUpdated: { type: Date, default: Date.now },
});

const Session = mongoose.model("Session", sessionSchema);

// In-memory storage (if DB not connected)
let sessions = {};

// REST API: Get session data
app.get("/api/session/:id", async (req, res) => {
  const { id } = req.params;
  
  try {
    // Try MongoDB first
    if (mongoose.connection.readyState === 1) {
      let session = await Session.findOne({ sessionId: id });
      if (!session) {
        session = new Session({ sessionId: id, nodes: [], connections: [] });
        await session.save();
      }
      return res.json(session);
    }
    
    // Fallback to in-memory
    if (!sessions[id]) {
      sessions[id] = { nodes: [], connections: [] };
    }
    res.json({ sessionId: id, ...sessions[id] });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch session" });
  }
});

// REST API: Save session data
app.post("/api/session/:id", async (req, res) => {
  const { id } = req.params;
  const { nodes, connections } = req.body;

  try {
    if (mongoose.connection.readyState === 1) {
      await Session.findOneAndUpdate(
        { sessionId: id },
        { nodes, connections, lastUpdated: Date.now() },
        { upsert: true, new: true }
      );
    } else {
      sessions[id] = { nodes, connections };
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to save session" });
  }
});

// WebSocket events
io.on("connection", (socket) => {
  console.log("🔗 User connected:", socket.id);

  socket.on("join-session", async (sessionId) => {
    socket.join(sessionId);
    console.log(`User ${socket.id} joined session: ${sessionId}`);
    
    // Send current session state
    let sessionData;
    if (mongoose.connection.readyState === 1) {
      sessionData = await Session.findOne({ sessionId });
    } else {
      sessionData = sessions[sessionId];
    }
    
    if (sessionData) {
      socket.emit("session-data", sessionData);
    }
  });

  socket.on("update-board", async (data) => {
    const { sessionId, nodes, connections } = data;
    
    // Update storage
    if (mongoose.connection.readyState === 1) {
      await Session.findOneAndUpdate(
        { sessionId },
        { nodes, connections, lastUpdated: Date.now() },
        { upsert: true }
      );
    } else {
      sessions[sessionId] = { nodes, connections };
    }
    
    // Broadcast to others in the session
    socket.to(sessionId).emit("board-updated", { nodes, connections });
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

app.get("/", (req, res) => res.send("✅ IdeaFlow Server Running"));

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));