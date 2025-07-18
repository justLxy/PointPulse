'use strict';

const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Set up file uploads for avatars
const avatarStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "..", "uploads", "avatars"));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, req.auth.utorid + "-" + uniqueSuffix + ext);
    },
});

// Set up file uploads for event backgrounds
const eventBackgroundStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "..", "uploads", "events"));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, "event-" + uniqueSuffix + ext);
    },
});

// Create uploads directories if they don't exist
const avatarUploadDir = path.join(__dirname, "..", "uploads", "avatars");
if (!fs.existsSync(avatarUploadDir)) {
    fs.mkdirSync(avatarUploadDir, { recursive: true });
}

const eventUploadDir = path.join(__dirname, "..", "uploads", "events");
if (!fs.existsSync(eventUploadDir)) {
    fs.mkdirSync(eventUploadDir, { recursive: true });
}

// Initialize upload middleware
const upload = multer({ storage: avatarStorage });
const eventBackgroundUpload = multer({ storage: eventBackgroundStorage });

module.exports = { upload, eventBackgroundUpload };