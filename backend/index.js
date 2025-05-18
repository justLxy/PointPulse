#!/usr/bin/env node
'use strict';

const port = process.env.PORT || 8000; // Use PORT env var or default to 8000

// Configuration
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000"; // This can be changed when deployed

const express = require("express");
const cors = require("cors");
const path = require("path");
const { expressjwt: jwt } = require("express-jwt");
const { createServer } = require("http");
const { Server } = require("socket.io");

// Import routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const eventRoutes = require("./routes/eventRoutes");
const promotionRoutes = require("./routes/promotionRoutes");

// Import error handlers
const { notFoundHandler, errorHandler } = require("./middlewares/errorMiddleware");

// Import JWT config
const { JWT_SECRET } = require("./utils/jwtConfig");

// Create Express app
const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO with CORS configuration
const io = new Server(httpServer, {
  cors: {
    origin: function (origin, callback) {
      const allowedOrigins = [
        FRONTEND_URL,
        // Add other specific origins if needed
      ];
      if (!origin || allowedOrigins.indexOf(origin) !== -1 || origin.startsWith('https://pointpulse')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true
  }
});

// Socket.IO connection handling
const connectedUsers = new Map(); // Store connected users: { userId: socketId }

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);
  
  // User authentication and tracking
  socket.on("authenticate", (data) => {
    if (data.userId) {
      // Store user's socket for later notifications
      connectedUsers.set(data.userId.toString(), socket.id);
      console.log(`User ${data.userId} authenticated with socket ${socket.id}`);
    }
  });
  
  // Handle disconnection
  socket.on("disconnect", () => {
    // Remove user from connectedUsers Map
    for (const [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  });
});

// Make io and connectedUsers available globally
app.set('io', io);
app.set('connectedUsers', connectedUsers);

// Middlewares
app.use(cors({
    origin: function (origin, callback) {
        const allowedOrigins = [
            FRONTEND_URL,
            // Add other specific origins if needed
        ];
        if (!origin || allowedOrigins.indexOf(origin) !== -1 || origin.startsWith('https://pointpulse')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// Serve static files from the uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Auth routes (no JWT required)
app.use("/auth", authRoutes);

// JWT authentication middleware
app.use(
    jwt({
        secret: JWT_SECRET,
        algorithms: ["HS256"],
    }).unless({
        path: [
            /^\/auth\//,
        ],
    })
);

// App routes (JWT required)
app.use("/users", userRoutes);
app.use("/transactions", transactionRoutes);
app.use("/events", eventRoutes);
app.use("/promotions", promotionRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const server = httpServer.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

server.on('error', (err) => {
    console.error(`cannot start server: ${err.message}`);
    process.exit(1);
});