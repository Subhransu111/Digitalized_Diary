const mongoose = require('mongoose');

let isConnected = false; // Track connection status

const connectDB = async (url) => {
    mongoose.set('strictQuery', true);

    if (isConnected) {
        console.log('MongoDB is already connected');
        return;
    }

    try {
        await mongoose.connect(url, {
            dbName: "Case-Diary",
            // Remove deprecated options like useNewUrlParser if using Mongoose 6+
        });

        isConnected = true;
        console.log('MongoDB connected');
    } catch (error) {
        console.log(error);
    }
}

module.exports = { connectDB };