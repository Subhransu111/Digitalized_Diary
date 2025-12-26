const mongoose = require('mongoose');

let isConnected = false; // Track the connection

const connectDB = async (url) => {
    mongoose.set('strictQuery', true);

    if (isConnected) {
        return; // Use existing connection
    }

    try {
        await mongoose.connect(url, {
            dbName: "Case-Diary",
        });
        isConnected = true;
        console.log('MongoDB Connected');
    } catch (error) {
        console.error('MongoDB Connection Error:', error);
    }
}

module.exports = { connectDB };