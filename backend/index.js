#!/usr/bin/env node
'use strict';

const port = (() => {
    const args = process.argv;

    if (args.length !== 3) {
        console.error("usage: node index.js port");
        process.exit(1);
    }

    const num = parseInt(args[2], 10);
    if (isNaN(num)) {
        console.error("error: argument must be an integer.");
        process.exit(1);
    }

    return num;
})();

// Configuration
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000"; // This can be changed when deployed

const express = require("express");
const cors = require("cors");
const path = require("path");
const { expressjwt: jwt } = require("express-jwt");

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
    origin: FRONTEND_URL,
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
const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

server.on('error', (err) => {
    console.error(`cannot start server: ${err.message}`);
    process.exit(1);
});