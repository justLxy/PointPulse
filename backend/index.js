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
            'http://localhost:3000',
            'http://localhost:3001',
            // Add other specific origins if needed
        ];
        
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // Allow all Vercel preview and production domains
        if (origin.includes('vercel.app') || 
            origin.includes('pointpulse') ||
            allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log('CORS blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
    credentials: true
}));

app.use(express.json());

// Serve static files from the uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Handle static files that might be requested from frontend
// These should ideally be served by the frontend, but we'll provide them here as fallback
app.get('/manifest.json', (req, res) => {
  res.json({
    "short_name": "PointPulse",
    "name": "PointPulse - UofT Loyalty Rewards",
    "icons": [
      {
        "src": "logo.png",
        "sizes": "64x64 32x32 24x24 16x16",
        "type": "image/png"
      },
      {
        "src": "logo.png",
        "type": "image/png",
        "sizes": "192x192"
      },
      {
        "src": "logo.png",
        "type": "image/png",
        "sizes": "512x512"
      }
    ],
    "start_url": ".",
    "display": "standalone",
    "theme_color": "#3498db",
    "background_color": "#f5f8fa"
  });
});

app.get('/favicon.ico', (req, res) => {
  res.status(404).end();
});

app.get('/logo.png', (req, res) => {
  res.status(404).end();
});

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
            /^\/uploads\//,
            '/manifest.json',
            '/favicon.ico',
            '/logo.png',
            // Add any other public paths that don't need authentication
        ],
    })
);

// App routes (JWT required)
app.use("/users", userRoutes);
app.use("/transactions", transactionRoutes);
app.use("/events", eventRoutes);
app.use("/promotions", promotionRoutes);
app.use("/products", productRoutes);

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
                    'http://localhost:3000',
                    'http://localhost:3001',
                    // Add other specific origins if needed
                ];
                
                // Allow requests with no origin
                if (!origin) return callback(null, true);
                
                // Allow all Vercel preview and production domains
                if (origin.includes('vercel.app') || 
                    origin.includes('pointpulse') ||
                    allowedOrigins.indexOf(origin) !== -1) {
                    callback(null, true);
                } else {
                    console.log('Socket.IO CORS blocked origin:', origin);
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