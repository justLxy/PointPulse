#!/usr/bin/env node
'use strict';

require('dotenv').config();
const port = process.env.PORT || 8000;
const app = require('./index');

const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

server.on('error', (err) => {
    console.error(`cannot start server: ${err.message}`);
    process.exit(1);
}); 