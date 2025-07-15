'use strict';

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
const productRoutes = require("./routes/productRoutes");
const shortlinkRoutes = require("./routes/shortlinkRoutes");

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
            /^\/products\/?.*/,
            /^\/shortlinks\/redirect\/?.*/,
        ],
    })
);

// App routes (JWT required)
app.use("/users", userRoutes);
app.use("/transactions", transactionRoutes);
app.use("/events", eventRoutes);
app.use("/promotions", promotionRoutes);
app.use("/products", productRoutes);
app.use("/shortlinks", shortlinkRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Socket.IO setup function to be called from server.js
app.setupSocketIO = (server) => {
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
    
    return io;
};

// Export the app for testing
module.exports = app;