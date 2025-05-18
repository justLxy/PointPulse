#!/usr/bin/env node
'use strict';

const port = process.env.PORT || 8000; // Use PORT env var or default to 8000

// Configuration
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000"; // This can be changed when deployed

const express = require("express");
const cors = require("cors");
const path = require("path");
const { expressjwt: jwt } = require("express-jwt");
const http = require('http');
const { Server } = require('socket.io');

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

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
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
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    // Handle user joining room based on UTORid
    socket.on('join', (utorid) => {
        if (utorid) {
            console.log(`User ${utorid} joined their room`);
            socket.join(utorid);
        }
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Add socket instance to app for access in routes
app.set('io', io);

// Start server
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

server.on('error', (err) => {
    console.error(`cannot start server: ${err.message}`);
    process.exit(1);
});