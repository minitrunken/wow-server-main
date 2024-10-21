const express = require('express');
const path = require('path');
const session = require('express-session');
const crypto = require('crypto');
const mongoose = require('mongoose');
const Key = require('./Keys');  // Ensure the Key model is properly defined in './Keys'

const app = express();

// Load environment variables (if using a .env file, use dotenv package)
const PORT = process.env.PORT || 80;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/server';  // Ensure to set up MongoDB URI
const SESSION_SECRET = process.env.SESSION_SECRET || 'yourSecretKey';
const HARDCODED_PASSWORD = process.env.PASSWORD || 'bajs123';

// Middleware to parse JSON body
app.use(express.json());

// Session configuration
app.use(session({
    secret: SESSION_SECRET, // Secure and unique secret key
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 1 day
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',  // Secure cookie for HTTPS in production
    }
}));

// MongoDB Connection
mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('MongoDB connection error: ', err));

// Helper function to generate a random key
function generateKey() {
    return crypto.randomBytes(16).toString('hex');
}

// Helper function to check if the key is still valid (within 30 days)
function isKeyValid(keyDoc) {
    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;  // 30 days in milliseconds
    const keyAge = Date.now() - keyDoc.createdAt.getTime();
    return keyAge <= THIRTY_DAYS;
}

// Serve the React app build
app.use(express.static(path.join(__dirname, '../', 'build')));

//////////////////////////////////
// ROUTES ************************
//////////////////////////////////

// Login route
app.post('/api/login', (req, res) => {
    const { password } = req.body;
    if (password === HARDCODED_PASSWORD) {
        req.session.isAuthenticated = true;  // Store authentication status in session
        res.status(200).json({ success: true, message: 'Login successful!' });
    } else {
        res.status(401).json({ success: false, message: 'Invalid password' });
    }
});

// Route to verify the key (POST /verifykey)
app.post('/verifykey', async (req, res) => {
    const { key } = req.body;
    try {
        const existingKey = await Key.findOne({ key });
        if (!existingKey) {
            return res.status(404).json({ success: false, message: 'Key not found' });
        }
        if (!isKeyValid(existingKey)) {
            return res.status(401).json({ success: false, message: 'Key is expired' });
        }
        res.status(200).json({ success: true, message: 'Key is valid' });
    } catch (err) {
        console.error('Error verifying key:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

//////////////////////////////////
// Routes for Fetching and Adding Keys
//////////////////////////////////

// Route to generate a new key (POST /api/generate-key)
app.post('/api/generate-key', async (req, res) => {
    const { key } = req.body;
    if (!key || key.trim() === '') {
        return res.status(400).json({ message: 'Key is required' });
    }
    const createdAt = Date.now();
    try {
        const keyDoc = new Key({ key, createdAt });
        await keyDoc.save();
        res.json({ success: true, key });
    } catch (err) {
        console.error('Error generating key:', err);
        if (err.code === 11000) {  // Duplicate key error
            return res.status(409).json({ message: 'Key already exists' });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

// Route to generate a random key (POST /generate-random-key)
app.post('/api/generate-random-key', async (req, res) => {
    const newKey = generateKey();
    const createdAt = Date.now();
    try {
        const keyDoc = new Key({ key: newKey, createdAt });
        await keyDoc.save();
        res.json({ success: true, key: newKey });
    } catch (err) {
        console.error('Error generating random key:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Fetch the list of keys (GET /api/keys)
app.get('/api/keys', async (req, res) => {
    try {
        const keys = await Key.find();  // Fetch all keys from MongoDB
        res.json(keys);
    } catch (err) {
        console.error('Error fetching keys:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Protected route (e.g., dashboard)
app.get('/api/dashboard', (req, res) => {
    if (req.session.isAuthenticated) {
        res.status(200).json({ message: 'Welcome to the dashboard!' });
    } else {
        res.status(401).json({ message: 'Unauthorized' });
    }
});

// Route to handle file updates, ensuring key validation
app.get('/updatefiles', async (req, res) => {
    const key = req.query.key;
    try {
        const existingKey = await Key.findOne({ key });
        if (!existingKey || !isKeyValid(existingKey)) {
            return res.status(401).json({ success: false, message: 'Key is invalid or expired' });
        }
        const filePath = path.join(__dirname, 'files', 'latest_version.zip');
        res.download(filePath, 'latest_version.zip', (err) => {
            if (err) {
                console.error('Error sending file:', err);
                res.status(500).send('File not found');
            }
        });
    } catch (err) {
        console.error('Error verifying key:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Catch-all route to serve the React app's index.html for client-side routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
