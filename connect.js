const mongoose = require('mongoose');

let connectionPromise = null;

const validateMongoUri = (url) => {
    const trimmedUrl = url.trim();

    if (trimmedUrl !== url) {
        throw new Error('MONGO_URI has leading or trailing whitespace. Remove the extra spaces from .env.');
    }

    if (/[<>]/.test(trimmedUrl)) {
        throw new Error(
            'MONGO_URI contains raw angle brackets. Replace Atlas placeholders like <password>, and URL-encode any real < or > characters as %3C or %3E.',
        );
    }

    let parsedUrl;

    try {
        parsedUrl = new URL(trimmedUrl);
    } catch (error) {
        throw new Error(`MONGO_URI is not a valid URL: ${error.message}`);
    }

    if (!['mongodb:', 'mongodb+srv:'].includes(parsedUrl.protocol)) {
        throw new Error('MONGO_URI must start with mongodb:// or mongodb+srv://');
    }

    if (!parsedUrl.hostname) {
        throw new Error('MONGO_URI is missing the MongoDB host.');
    }

    if (parsedUrl.protocol === 'mongodb+srv:' && parsedUrl.hostname === '>') {
        throw new Error('MONGO_URI host is ">". Replace the Atlas template placeholders with real values.');
    }

    return trimmedUrl;
};

const connectDB = async (url) => {
    mongoose.set('strictQuery', true);

    if (!url) {
        throw new Error('MONGO_URI is missing in Environment Variables');
    }

    const mongoUri = validateMongoUri(url);

    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }

    if (connectionPromise) {
        return connectionPromise;
    }

    connectionPromise = mongoose
        .connect(mongoUri, {
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
