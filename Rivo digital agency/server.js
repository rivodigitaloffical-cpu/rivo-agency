const express = require('express');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Hardcoded Admin Credentials
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'admin123';

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'rivodigital_secret_key_123',
    resave: false,
    saveUninitialized: false
}));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Multer setup for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Database (JSON file) Helper Functions
const dataFile = path.join(__dirname, 'data.json');
const getData = () => JSON.parse(fs.readFileSync(dataFile, 'utf8'));
const saveData = (data) => fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));

// ---- ROUTES ----

// API to fetch settings (public)
app.get('/api/settings', (req, res) => {
    res.json(getData());
});

// Admin Route Guard
const isAuthenticated = (req, res, next) => {
    if (req.session.loggedIn) {
        next();
    } else {
        res.redirect('/admin_login.html');
    }
};

// Admin Login Process
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_USER && password === ADMIN_PASS) {
        req.session.loggedIn = true;
        res.redirect('/admin');
    } else {
        res.status(401).send('<script>alert("Invalid Credentials"); window.location.href="/admin_login.html";</script>');
    }
});

// Admin Logout Process
app.get('/api/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// API to update settings (protected)
app.post('/api/settings/update', isAuthenticated, upload.fields([
    { name: 'slide1', maxCount: 1 },
    { name: 'slide2', maxCount: 1 },
    { name: 'slide3', maxCount: 1 },
    { name: 'videoThumb', maxCount: 1 }
]), (req, res) => {
    
    let currentData = getData();
    
    // Update Video Link
    if (req.body.videoLink) {
        currentData.videoLink = req.body.videoLink;
    }

    // Update Images if uploaded
    if (req.files['slide1']) currentData.slides[0] = 'images/' + req.files['slide1'][0].filename;
    if (req.files['slide2']) currentData.slides[1] = 'images/' + req.files['slide2'][0].filename;
    if (req.files['slide3']) currentData.slides[2] = 'images/' + req.files['slide3'][0].filename;
    if (req.files['videoThumb']) currentData.videoThumb = 'images/' + req.files['videoThumb'][0].filename;

    saveData(currentData);
    res.redirect('/admin?success=true');
});

// Protect admin route explicitly
app.get('/admin', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
