const express = require('express');
const app = express();
const port = process.env.PORT || 8000;
require('dotenv').config(); // Load environment variables
const cors = require('cors');

// Import Routes
const caseRoute = require('./routes/caseRoutes');
const caseFactRoute = require('./routes/caseFactRoutes');
const witnessRoute = require('./routes/witnessRoutes');
const seizureRoute = require('./routes/seizureRoutes');
const evidenceLogRoute = require('./routes/evidencelogRoutes');
const analyticsRoute = require('./routes/analyticsRoutes');
const checkJwt = require('./middlware/auth');

// Import Database Connection
const { connectDB } = require('./connect');

// --- FIX 1: CORS (Allow Vercel Frontend) ---
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        // Allow localhost AND your Vercel frontend
        const allowedOrigins = ['http://localhost:5173', 'https://digitalized-diary.vercel.app'];
        // OR just allow ALL for now to test: return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || true) { // '|| true' allows everyone for testing
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// --- FIX 2: Vercel "Serverless" Middleware ---
// This connects to the DB *before* every request. 
// Vercel pauses servers, so we need to reconnect when they wake up.
app.use(async (req, res, next) => {
    try {
        // Use the Environment Variable (NOT localhost!)
        const dbUrl = process.env.MONGO_URI; 
        
        if (!dbUrl) {
            throw new Error("MONGO_URI is missing in Environment Variables");
        }
        
        await connectDB(dbUrl);
        next(); // Proceed to the route
    } catch (error) {
        console.error("Database Connection Failed:", error);
        res.status(500).json({ error: "Database Connection Error" });
    }
});

// --- Routes ---
app.use('/api/v1/cases', checkJwt, caseRoute);
app.use('/api/v1/casefacts', checkJwt, caseFactRoute);
app.use('/api/v1/witnesses', checkJwt, witnessRoute);
app.use('/api/v1/seizures', checkJwt, seizureRoute);
app.use('/api/v1/evidencelogs', checkJwt, evidenceLogRoute);
app.use('/api/v1/analytics', checkJwt, analyticsRoute);

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: "Server is running",
        timestamp: new Date()
    });
});

// Vercel Start Command
if (require.main === module) {
    app.listen(port, () => console.log(`Server running on port ${port}`));
}

module.exports = app;