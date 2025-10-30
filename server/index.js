import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import pkg from "pg";
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

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

// ========== SUPABASE POSTGRESQL CONNECTION ==========

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Test database connection on startup
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection error:', err.message);
    console.log('⚠️  Falling back to in-memory storage');
  } else {
    console.log('✅ Connected to Supabase PostgreSQL');
    console.log('📅 Server time:', res.rows[0].now);
  }
});

// Fallback in-memory storage (if DB fails)
let sessions = {};

// ========== DATABASE HELPER FUNCTIONS ==========

async function getSessionFromDB(sessionId) {
  try {
    const result = await pool.query(
      'SELECT nodes, connections FROM sessions WHERE session_id = $1',
      [sessionId]
    );

    if (result.rows.length > 0) {
      return {
        nodes: result.rows[0].nodes || [],
        connections: result.rows[0].connections || []
      };
    }

    return null; // Session doesn't exist yet
  } catch (error) {
    console.error('Error fetching session from DB:', error.message);
    return null;
  }
}

async function saveSessionToDB(sessionId, nodes, connections) {
  try {
    await pool.query(
      `INSERT INTO sessions (session_id, nodes, connections, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (session_id) 
       DO UPDATE SET 
         nodes = $2,
         connections = $3,
         updated_at = NOW()`,
      [sessionId, JSON.stringify(nodes), JSON.stringify(connections)]
    );

    console.log(`💾 Session saved to DB: ${sessionId}`);
    return true;
  } catch (error) {
    console.error('Error saving session to DB:', error.message);
    return false;
  }
}

// ========== REST API ENDPOINTS ==========

// Health check
app.get("/", (req, res) => {
  res.json({
    status: "✅ IdeaFlow Server Running",
    database: "Supabase PostgreSQL",
    timestamp: new Date().toISOString()
  });
});

// Database health check
app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as time, COUNT(*) as count FROM sessions');
    res.json({
      status: "healthy",
      database: "connected",
      timestamp: result.rows[0].time,
      totalSessions: parseInt(result.rows[0].count)
    });
  } catch (error) {
    res.status(500).json({
      status: "unhealthy",
      database: "disconnected",
      error: error.message
    });
  }
});

// Get session data
app.get("/api/session/:id", async (req, res) => {
  const { id } = req.params;
  
  try {
    // Try to get from database
    let sessionData = await getSessionFromDB(id);
    
    if (sessionData) {
      return res.json({ sessionId: id, ...sessionData });
    }

    // If not in DB, return empty session
    const emptySession = { nodes: [], connections: [] };
    res.json({ sessionId: id, ...emptySession });
    
  } catch (error) {
    console.error('Error in GET /api/session:', error);
    
    // Fallback to in-memory
    if (!sessions[id]) {
      sessions[id] = { nodes: [], connections: [] };
    }
    res.json({ sessionId: id, ...sessions[id] });
  }
});

// Save session data
app.post("/api/session/:id", async (req, res) => {
  const { id } = req.params;
  const { nodes, connections } = req.body;

  try {
    // Try to save to database
    const saved = await saveSessionToDB(id, nodes, connections);
    
    if (saved) {
      return res.json({ success: true, storage: 'database' });
    }

    // Fallback to in-memory
    sessions[id] = { nodes, connections };
    res.json({ success: true, storage: 'memory' });
    
  } catch (error) {
    console.error('Error in POST /api/session:', error);
    
    // Fallback to in-memory
    sessions[id] = { nodes, connections };
    res.json({ success: true, storage: 'memory' });
  }
});

// Delete session (optional)
app.delete("/api/session/:id", async (req, res) => {
  const { id } = req.params;
  
  try {
    await pool.query('DELETE FROM sessions WHERE session_id = $1', [id]);
    delete sessions[id]; // Also remove from memory
    res.json({ success: true, message: 'Session deleted' });
  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// List all sessions (for debugging)
app.get("/api/sessions", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT session_id, 
              jsonb_array_length(nodes) as node_count,
              jsonb_array_length(connections) as connection_count,
              updated_at
       FROM sessions 
       ORDER BY updated_at DESC 
       LIMIT 100`
    );

    res.json({ 
      total: result.rows.length,
      sessions: result.rows 
    });
  } catch (error) {
    console.error('Error listing sessions:', error);
    res.json({ 
      total: Object.keys(sessions).length,
      sessions: Object.keys(sessions),
      storage: 'memory'
    });
  }
});

// ========== WEBSOCKET EVENTS ==========

io.on("connection", (socket) => {
  console.log("🔗 User connected:", socket.id);

  socket.on("join-session", async (sessionId) => {
    socket.join(sessionId);
    console.log(`👤 User ${socket.id} joined session: ${sessionId}`);
    
    try {
      // Try to get from database
      let sessionData = await getSessionFromDB(sessionId);
      
      if (!sessionData) {
        // Session doesn't exist, return empty
        sessionData = { nodes: [], connections: [] };
      }
      
      socket.emit("session-data", sessionData);
      
    } catch (error) {
      console.error('Error loading session:', error);
      
      // Fallback to in-memory
      const sessionData = sessions[sessionId] || { nodes: [], connections: [] };
      socket.emit("session-data", sessionData);
    }
  });

  socket.on("update-board", async (data) => {
    const { sessionId, nodes, connections } = data;
    
    try {
      // Try to save to database
      await saveSessionToDB(sessionId, nodes, connections);
    } catch (error) {
      console.error('Error saving to DB, using memory:', error.message);
      // Fallback to in-memory
      sessions[sessionId] = { nodes, connections };
    }
    
    // Broadcast to all clients in the session (including sender)
    io.to(sessionId).emit("board-updated", { nodes, connections });
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

// ========== GRACEFUL SHUTDOWN ==========

process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, closing server gracefully...');
  await pool.end();
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('\n🛑 SIGINT received, closing server gracefully...');
  await pool.end();
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

// ========== START SERVER ==========

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   🧠 IdeaFlow Backend Server          ║
║   📡 Port: ${PORT}                        ║
║   💾 Database: Supabase PostgreSQL     ║
║   ✅ Real-time: Socket.IO              ║
╚════════════════════════════════════════╝
  `);
});