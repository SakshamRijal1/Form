import dns from "dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);


import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";

import authRoutes from "./routes/authRoutes.js";
import formRoutes from "./routes/formRoutes.js";
import connectDB from "./config/db.js";

const app = express();
const httpServer = http.createServer(app);

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());

app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "Form Builder API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/forms", formRoutes);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true
  }
});

io.on("connection", (socket) => {
  socket.on("join-form", (formId) => {
    socket.join(`form:${formId}`);
  });

  socket.on("form-updated", ({ formId }) => {
    socket.to(`form:${formId}`).emit("form-updated");
  });

  socket.on("response-submitted", ({ formId }) => {
    socket.to(`form:${formId}`).emit("response-submitted");
  });
});

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    httpServer.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Database connection failed:", error);
    process.exit(1);
  });
