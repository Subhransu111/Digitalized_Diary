const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema({
    caseNumber: {
        type: String,
        required: true,
    },
    caseTitle: {
        type: String,
        required: true,
    },
    caseDescription: {
        type: String,
        required: true,
    },
    caseStatus: {
        type: String,
        default: "Open",
    },
    createdBy: {
        type: String,
    },
    evidenceFiles: [
        {
            filename: String,
            originalName: String,
            path: String,
            mimetype: String,
            size: Number,
            uploadedAt: {
                type: Date,
                default: Date.now,
            },
        },
    ],
    embedding: {
        type: [Number],
        default: [],
    },
    searchText: {
        type: String,
        default: '',
    },
}, { timestamps: true });

module.exports = mongoose.model('Case', caseSchema);
