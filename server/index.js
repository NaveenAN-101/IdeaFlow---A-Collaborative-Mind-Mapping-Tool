import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
// import mongoose from "mongoose"; // <-- REMOVED/COMMENTED OUT

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

// // Session Schema (for persistence) - COMMENTED OUT
// const sessionSchema = new mongoose.Schema({
//   sessionId: { type: String, unique: true, required: true },
//   nodes: { type: Array, default: [] },
//   connections: { type: Array, default: [] },
//   lastUpdated: { type: Date, default: Date.now },
// });
// const Session = mongoose.model("Session", sessionSchema);

// In-memory storage (this is now the only storage method)
let sessions = {};

// REST API: Get session data
app.get("/api/session/:id", async (req, res) => {
  const { id } = req.params;
  
  try {
    // // Try MongoDB first - COMMENTED OUT
    // if (mongoose.connection.readyState === 1) {
    //   let session = await Session.findOne({ sessionId: id });
    //   if (!session) {
    //     session = new Session({ sessionId: id, nodes: [], connections: [] });
    //     await session.save();
    //   }
    //   return res.json(session);
    // }
    
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
    // // Try MongoDB first - COMMENTED OUT
    // if (mongoose.connection.readyState === 1) {
    //   await Session.findOneAndUpdate(
    //     { sessionId: id },
    //     { nodes, connections, lastUpdated: Date.now() },
    //     { upsert: true, new: true }
    //   );
    // } else {
    //   sessions[id] = { nodes, connections };
    // }
    
    // Simplified to only use in-memory storage
    sessions[id] = { nodes, connections };
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
    
    // // Try MongoDB first - COMMENTED OUT
    // let sessionData;
    // if (mongoose.connection.readyState === 1) {
    //   sessionData = await Session.findOne({ sessionId });
    // } else {
    //   sessionData = sessions[sessionId];
    // }
    
    // Simplified to only use in-memory storage
    const sessionData = sessions[sessionId];
    if (sessionData) {
      socket.emit("session-data", sessionData);
    }
  });

  socket.on("update-board", async (data) => {
    const { sessionId, nodes, connections } = data;
    
    // // Try MongoDB first - COMMENTED OUT
    // if (mongoose.connection.readyState === 1) {
    //   await Session.findOneAndUpdate(
    //     { sessionId },
    //     { nodes, connections, lastUpdated: Date.now() },
    //     { upsert: true }
    //   );
    // } else {
    //   sessions[sessionId] = { nodes, connections };
    // }

    // Simplified to only use in-memory storage
    sessions[sessionId] = { nodes, connections };
    
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