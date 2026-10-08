import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import http from "http";
import path from "path";
import dns from "dns";
import passport from "passport";
import { Server } from "socket.io";

import formRoutes from "./routes/formRoutes.js";
import authRoutes from "./routes/authRoutes.js";

// Load environment variables
dotenv.config();

// --------------------------------------------------
// DNS FIX FOR MONGODB ATLAS
// --------------------------------------------------
dns.setServers(["8.8.8.8", "1.1.1.1"]);

// --------------------------------------------------
// APP
// --------------------------------------------------
const app = express();
const server = http.createServer(app);

// --------------------------------------------------
// PORT
// --------------------------------------------------
const PORT = process.env.PORT || 5000;

// --------------------------------------------------
// FRONTEND URL
// --------------------------------------------------
const CLIENT_URL =
  process.env.CLIENT_URL ||
  process.env.FRONTEND_URL ||
  "http://localhost:5173";

// --------------------------------------------------
// SOCKET.IO
// --------------------------------------------------
const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    credentials: true,
    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE"
    ]
  }
});

// --------------------------------------------------
// SOCKET.IO EVENTS
// --------------------------------------------------
io.on("connection", (socket) => {
  console.log("🔌 Socket connected:", socket.id);

  // User joins a particular form room
  socket.on("join-form", (formId) => {
    if (!formId) return;

    socket.join(`form:${formId}`);

    console.log(
      `👤 Socket ${socket.id} joined form:${formId}`
    );
  });

  // Notify everyone editing the form
  socket.on("form-updated", ({ formId }) => {
    if (!formId) return;

    socket.to(`form:${formId}`).emit("form-updated", {
      formId
    });

    console.log(`🔄 Form updated: ${formId}`);
  });

  socket.on("disconnect", () => {
    console.log(
      "❌ Socket disconnected:",
      socket.id
    );
  });
});

// Make io available to controllers
app.set("io", io);

// --------------------------------------------------
// MIDDLEWARE
// --------------------------------------------------

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS"
    ],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With"
    ]
  })
);

// JSON
app.use(
  express.json({
    limit: "10mb"
  })
);

// URL encoded
app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb"
  })
);

// Cookies
app.use(cookieParser());

// --------------------------------------------------
// PASSPORT
// --------------------------------------------------

app.use(passport.initialize());

// --------------------------------------------------
// UPLOADS DIRECTORY
// --------------------------------------------------

const uploadsPath = path.join(
  process.cwd(),
  "uploads"
);

app.use(
  "/uploads",
  express.static(uploadsPath)
);

// --------------------------------------------------
// HEALTH CHECK
// --------------------------------------------------

app.get("/", (req, res) => {
  res.json({
    success: true,
    message:
      "Google Forms Clone API is running 🚀",
    version: "1.0.0"
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is healthy",
    database:
      mongoose.connection.readyState === 1
        ? "connected"
        : "disconnected"
  });
});

// --------------------------------------------------
// API ROUTES
// --------------------------------------------------

// Authentication
app.use(
  "/api/auth",
  authRoutes
);

// Forms
app.use(
  "/api/forms",
  formRoutes
);

// --------------------------------------------------
// 404 HANDLER
// --------------------------------------------------

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// --------------------------------------------------
// GLOBAL ERROR HANDLER
// --------------------------------------------------

app.use(
  (err, req, res, next) => {
    console.error("🔥 SERVER ERROR:");
    console.error(err);

    // Multer file too large
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message:
          "File is too large. Maximum allowed size is 5 MB."
      });
    }

    // Multer errors
    if (err.name === "MulterError") {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    res.status(err.status || 500).json({
      success: false,
      message:
        err.message ||
        "Internal server error"
    });
  }
);

// --------------------------------------------------
// MONGODB CONNECTION
// --------------------------------------------------

async function connectDatabase() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error(
        "MONGO_URI is missing in your .env file"
      );
    }

    console.log(
      "⏳ Connecting to MongoDB..."
    );

    await mongoose.connect(
      process.env.MONGO_URI
    );

    console.log("✅ MongoDB connected");

    console.log(
      `📦 Database: ${mongoose.connection.name}`
    );
  } catch (error) {
    console.error(
      "❌ MongoDB connection failed"
    );

    console.error(error.message);

    process.exit(1);
  }
}

// --------------------------------------------------
// MONGOOSE EVENTS
// --------------------------------------------------

mongoose.connection.on(
  "connected",
  () => {
    console.log(
      "🟢 Mongoose connected"
    );
  }
);

mongoose.connection.on(
  "error",
  (error) => {
    console.error(
      "🔴 MongoDB error:",
      error.message
    );
  }
);

mongoose.connection.on(
  "disconnected",
  () => {
    console.log(
      "🟡 MongoDB disconnected"
    );
  }
);

// --------------------------------------------------
// START SERVER
// --------------------------------------------------

async function startServer() {
  try {
    await connectDatabase();

    server.listen(
      PORT,
      () => {
        console.log("");
        console.log(
          "======================================"
        );
        console.log(
          "🚀 GOOGLE FORMS CLONE SERVER"
        );
        console.log(
          "======================================"
        );

        console.log(
          `📡 Server: http://localhost:${PORT}`
        );

        console.log(
          `❤️  Health: http://localhost:${PORT}/api/health`
        );

        console.log(
          `🔐 Auth: http://localhost:${PORT}/api/auth`
        );

        console.log(
          `📁 Uploads: http://localhost:${PORT}/uploads`
        );

        console.log(
          `🌐 Frontend: ${CLIENT_URL}`
        );

        console.log(
          "======================================"
        );

        console.log("");
      }
    );
  } catch (error) {
    console.error(
      "❌ Failed to start server:",
      error.message
    );

    process.exit(1);
  }
}

startServer();

// --------------------------------------------------
// GRACEFUL SHUTDOWN
// --------------------------------------------------

process.on(
  "SIGINT",
  async () => {
    console.log(
      "\n🛑 Shutting down server..."
    );

    await mongoose.connection.close();

    server.close(() => {
      console.log(
        "✅ Server stopped"
      );

      process.exit(0);
    });
  }
);

process.on(
  "SIGTERM",
  async () => {
    console.log(
      "\n🛑 SIGTERM received..."
    );

    await mongoose.connection.close();

    server.close(() => {
      console.log(
        "✅ Server stopped"
      );

      process.exit(0);
    });
  }
);