'use strict';

const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Set up file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "..", "uploads", "avatars"));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, req.auth.utorid + "-" + uniqueSuffix + ext);
    },
});

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, "..", "uploads", "avatars");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Initialize upload middleware
const upload = multer({ storage });

module.exports = { upload };