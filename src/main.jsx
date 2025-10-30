import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import SessionLanding from "./components/SessionLanding";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SessionLanding />} />
        <Route path="/session/:sessionId" element={<App />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);