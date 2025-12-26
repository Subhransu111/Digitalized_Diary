const express = require('express');
const app = express();
const port = process.env.PORT || 8000;
const caseRoute = require('./routes/caseRoutes')
const caseFactRoute = require('./routes/caseFactRoutes')
const witnessRoute = require('./routes/witnessRoutes')
const seizureRoute = require('./routes/seizureRoutes')
const evidenceLogRoute = require('./routes/evidencelogRoutes')
const analyticsRoute = require('./routes/analyticsRoutes')
const initCronJobs = require ('./utils/cronJobs')
const checkJwt = require('./middlware/auth');
const cors = require('cors');
//Database connection
const {connectDB} = require('./connect');
connectDB('mongodb://localhost:27017/Case-Diary')
    .then(()=>{
        console.log("Database connected");
        // Initialize Cron Jobs after DB connection
        initCronJobs();
    });


//Middleware
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173', // Allow your specific Vite Frontend port
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'] // Allow sending tokens
})); // Allow frontend requests from different origin


//Routes 
app.use('/api/v1/cases', checkJwt, caseRoute);
app.use('/api/v1/casefacts', checkJwt, caseFactRoute);
app.use('/api/v1/witnesses', checkJwt, witnessRoute);
app.use('/api/v1/seizures', checkJwt, seizureRoute);
app.use('/api/v1/evidencelogs', checkJwt, evidenceLogRoute);
app.use('/api/v1/analytics', checkJwt, analyticsRoute);

//Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: "Server is running",
        timestamp: new Date()
    });
});

if (require.main === module) {
    app.listen(port, () => console.log(`Server running on port ${port}`));
}

module.exports = app;