const mongoose = require('mongoose');
const loadEnv = require('../utils/loadEnv');

loadEnv({
    override: true,
});

const Case = require('../models/Case');
const { generateEmbedding } = require('../services/geminiService');

function buildSearchText(caseItem) {
    return [
        `Number: ${caseItem.caseNumber || ''}`,
        `Title: ${caseItem.caseTitle || ''}`,
        `Description: ${caseItem.caseDescription || ''}`,
    ].join(' | ');
}

async function backfill() {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
        console.error('ERROR: MONGO_URI missing in Environment Variables');
        process.exit(1);
    }

    try {
        console.log('Connecting to Database...');
        await mongoose.connect(mongoUri);
        console.log('Database connected successfully.');

        const casesToUpdate = await Case.find({
            $or: [
                { embedding: { $exists: false } },
                { embedding: { $size: 0 } },
                { searchText: { $exists: false } },
                { searchText: '' },
            ],
        });

        console.log(`Found ${casesToUpdate.length} cases needing embedding generation.`);

        for (let i = 0; i < casesToUpdate.length; i += 1) {
            const caseItem = casesToUpdate[i];
            console.log(`[${i + 1}/${casesToUpdate.length}] Processing Case ${caseItem.caseNumber}...`);

            const searchText = buildSearchText(caseItem);

            try {
                const vector = await generateEmbedding(searchText);
                caseItem.embedding = vector;
                caseItem.searchText = searchText;
                await caseItem.save();
                console.log(`Generated vector embedding for Case ${caseItem.caseNumber}.`);
            } catch (error) {
                console.error(`Failed to update Case ${caseItem.caseNumber}:`, error.message);
            }
        }

        console.log('Embedding backfill script finished execution.');
        process.exit(0);
    } catch (error) {
        console.error('Database connection failure:', error);
        process.exit(1);
    }
}

backfill();
