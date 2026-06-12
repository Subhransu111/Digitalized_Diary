const mongoose = require('mongoose');

let connectionPromise = null;

const connectDB = async (url) => {
    mongoose.set('strictQuery', true);

    if (!url) {
        throw new Error('MONGO_URI is missing in Environment Variables');
    }

    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }

    if (connectionPromise) {
        return connectionPromise;
    }

    connectionPromise = mongoose
        .connect(url, {
            dbName: "Case-Diary",
        })
        .then((mongooseInstance) => {
            connectionPromise = null;
            console.log('MongoDB Connected');
            return mongooseInstance.connection;
        })
        .catch((error) => {
            connectionPromise = null;
            console.error('MongoDB Connection Error:', error);
            throw error;
        });

    return connectionPromise;
};

module.exports = { connectDB };
