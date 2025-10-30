```markdown
# 🧠 IdeaFlow — Real-Time Collaborative Mind Mapping

<div align="center">

![IdeaFlow](https://img.shields.io/badge/IdeaFlow-Collaborative%20Mind%20Mapping-blueviolet?style=for-the-badge)

### Transform your ideas into visual masterpieces — together, in real time.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-View-success?style=for-the-badge)](https://idea-flow-a-collaborative-mind-mapp.vercel.app)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)
[![React](https://img.shields.io/badge/React-18.2-61dafb?style=for-the-badge&logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.6-010101?style=for-the-badge&logo=socket.io)](https://socket.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-336791?style=for-the-badge&logo=postgresql)](https://supabase.com)

[**🌐 Live Demo**](https://idea-flow-a-collaborative-mind-mapp.vercel.app) ·
[**🐛 Report Bug**](https://github.com/NaveenAN-101/IdeaFlow---A-Collaborative-Mind-Mapping-Tool/issues) ·
[**💡 Request Feature**](https://github.com/NaveenAN-101/IdeaFlow---A-Collaborative-Mind-Mapping-Tool/issues)

</div>

---

## ✨ Overview

**IdeaFlow** is a modern **real-time collaborative mind mapping web app** built with React, Node.js, Socket.IO, and Supabase PostgreSQL.  
It enables users to **create, connect, and visualize ideas together instantly** — no sign-up, no clutter, just pure collaboration.

---

## 📸 Screenshots

| Landing Page                             | Mind Map Editor                        | Real-Time Collaboration                              |
| ---------------------------------------- | -------------------------------------- | ---------------------------------------------------- |
| ![Landing](docs/screenshots/landing.png) | ![Editor](docs/screenshots/editor.png) | ![Collaboration](docs/screenshots/collaboration.png) |

---

## 🧩 Features

### 🎨 **Visual Creation**

- Multiple node shapes — Rectangle, Circle, Diamond, Hexagon, Star, Cloud
- Smart curved connections with draggable anchors
- Infinite zoomable canvas
- Color and font customization

### ⚡ **Real-Time Collaboration**

- Instant sync across devices (Socket.IO)
- Join via simple session ID or link
- Live editing, auto-update, multi-user support

### 💾 **Persistence & Export**

- Auto-save to Supabase
- Resume any session later
- Export mind maps to JSON or PNG

### 🧠 **User Experience**

- Drag & Drop interactions
- Keyboard shortcuts for speed
- Smooth animations and responsive layout

---

## 🛠️ Tech Stack

| Layer        | Technologies                                  |
| ------------ | --------------------------------------------- |
| **Frontend** | React 18, Vite, Socket.IO Client, HTML2Canvas |
| **Backend**  | Node.js, Express.js, Socket.IO                |
| **Database** | Supabase (PostgreSQL + JSONB)                 |
| **Hosting**  | Vercel (Frontend), Render (Backend)           |

---

## 🏗️ Architecture
```

┌───────────────────────────────────────────────┐
│ Frontend │
│ React + Socket.IO Client (Vercel) │
│ - UI Rendering │
│ - Session Management │
│ - Real-time Board Updates │
└──────────────┬────────────────────────────────┘
WebSocket / REST
│
▼
┌───────────────────────────────────────────────┐
│ Backend │
│ Node.js + Express + Socket.IO (Render) │
│ - API Routes │
│ - Socket Event Handling │
│ - Data Persistence │
└──────────────┬────────────────────────────────┘
SQL Queries
│  
 ▼
┌───────────────────────────────────────────────┐
│ Supabase DB │
│ PostgreSQL + JSONB Tables │
│ - sessions (nodes + connections) │
└───────────────────────────────────────────────┘

````

---

## 🚀 Getting Started

### **1️⃣ Clone the Repository**
```bash
git clone https://github.com/NaveenAN-101/IdeaFlow---A-Collaborative-Mind-Mapping-Tool.git
cd IdeaFlow---A-Collaborative-Mind-Mapping-Tool
````

### **2️⃣ Install Frontend**

```bash
npm install
```

### **3️⃣ Install Backend**

```bash
cd server
npm install
cd ..
```

### **4️⃣ Setup Supabase Database**

Create a new project on [Supabase](https://supabase.com) and run:

```sql
CREATE TABLE sessions (
  id BIGSERIAL PRIMARY KEY,
  session_id TEXT UNIQUE NOT NULL,
  nodes JSONB DEFAULT '[]'::jsonb,
  connections JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_session_id ON sessions(session_id);
```

### **5️⃣ Configure Environment Variables**

In `/server/.env`:

```env
DATABASE_URL=postgresql://postgres:[password]@db.xxxxx.supabase.co:5432/postgres
PORT=4000
NODE_ENV=development
```

---

## 💻 Run Locally

### **Backend**

```bash
cd server
npm run dev
```

### **Frontend**

```bash
npm run dev
```

Then open 👉 `http://localhost:5173`

---

## 🌐 Deployment

### **Frontend (Vercel)**

1. Push to GitHub
2. Import repo to [Vercel](https://vercel.com)
3. Add rewrite rule:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### **Backend (Render)**

- Root directory: `server/`
- Build Command: `npm install`
- Start Command: `npm start`
- Environment Variables:

  - `DATABASE_URL=postgresql://...`
  - `NODE_ENV=production`

### **Database (Supabase)**

- Create project
- Run SQL above
- Copy connection string to Render environment variables

---

## 🔌 API Endpoints

| Method | Endpoint           | Description         |
| ------ | ------------------ | ------------------- |
| GET    | `/`                | Server health check |
| GET    | `/api/session/:id` | Fetch session data  |
| POST   | `/api/session/:id` | Save/update session |
| DELETE | `/api/session/:id` | Delete session      |
| GET    | `/api/sessions`    | List all sessions   |

---

## 💬 WebSocket Events

| Direction       | Event           | Description               |
| --------------- | --------------- | ------------------------- |
| Client → Server | `join-session`  | Join a shared session     |
| Client → Server | `update-board`  | Send board changes        |
| Server → Client | `session-data`  | Sync initial session data |
| Server → Client | `board-updated` | Push updates to all users |

---

## 📁 Directory Structure

```
IdeaFlow/
├── public/
│   └── vite.svg
├── src/
│   ├── components/
│   │   └── Node.jsx
│   ├── App.jsx
│   ├── App.css
│   ├── main.jsx
│   ├── socket.js
│   └── index.css
├── server/
│   ├── index.js
│   ├── package.json
│   └── .env
├── .gitignore
├── README.md
├── vite.config.js
└── package.json
```

---

## 🔮 Future Enhancements

- [ ] Undo/Redo functionality
- [ ] User authentication (Supabase Auth)
- [ ] Private sessions with passwords
- [ ] Live cursors for collaborators
- [ ] AI-generated idea suggestions
- [ ] Offline mode with sync
- [ ] Export as PDF/SVG
- [ ] Presentation mode

---

## 🐛 Known Issues

- Render free-tier backend sleeps after inactivity
- Supabase pauses if idle >7 days
- Large maps (500+ nodes) may lag slightly

---

## 📜 License

MIT License © 2025 **Naveen AN**
See [LICENSE](LICENSE) for details.

---

## 💬 Contact

**Naveen AN**
📧 Email: [naveen.an0523@gmail.com]
💼 LinkedIn: [www.linkedin.com/in/naveen-anandha-narayanan-06197730a]
📦 GitHub: [github.com/NaveenAN-101](https://github.com/NaveenAN-101)

---

<div align="center">

### ⭐ If you found this project useful, please give it a star!

Built with ❤️ by **Naveen AN**

</div>
