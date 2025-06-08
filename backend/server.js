#!/usr/bin/env node
'use strict';

require('dotenv').config();
const port = process.env.PORT || 8000;
const http = require('http');
const app = require('./index');

// Create HTTP server
const server = http.createServer(app);

// Set up Socket.IO
const io = app.setupSocketIO(server);

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`WebSocket server is available`);
});

server.on('error', (err) => {
    console.error(`cannot start server: ${err.message}`);
    process.exit(1);
}); 