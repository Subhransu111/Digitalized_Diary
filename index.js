const express = require('express');
const app = express();
const port = 8000;
const caseRoute = require('./routes/caseRoutes')
const caseFactRoute = require('./routes/caseFactRoutes')
const witnessRoute = require('./routes/witnessRoutes')
const seizureRoute = require('./routes/seizureRoutes')
const evidenceLogRoute = require('./routes/evidencelogRoutes')
const analyticsRoute = require('./routes/analyticsRoutes')
const initCronJobs = require ('./utils/cronJobs')
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


//Routes 
app.use('/api/v1/cases', caseRoute);
app.use('/api/v1/casefacts', caseFactRoute);
app.use('/api/v1/witnesses', witnessRoute);
app.use('/api/v1/seizures', seizureRoute);
app.use('/api/v1/evidencelogs', evidenceLogRoute);
app.use('/api/v1/analytics', analyticsRoute);

//Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: "Server is running",
        timestamp: new Date()
    });
});

app.listen(port,()=>{
    console.log("Server is running on port " + port);
})