const loadEnv = require('../utils/loadEnv');

loadEnv({
    override: true,
});

const Case = require('../models/Case');
const { connectDB } = require('../connect');
const {
    generateEmbedding,
    EMBEDDING_MODEL,
    EMBEDDING_DIMENSIONALITY,
} = require('../services/geminiService');
const CASE_EMBEDDING_TASK_TYPE = 'RETRIEVAL_DOCUMENT';

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
        await connectDB(mongoUri);
        console.log('Database connected successfully.');

        const casesToUpdate = await Case.find({
            $or: [
                { embedding: { $exists: false } },
                { embedding: { $size: 0 } },
                { embeddingModel: { $exists: false } },
                { embeddingModel: { $ne: EMBEDDING_MODEL } },
                { embeddingTaskType: { $exists: false } },
                { embeddingTaskType: { $ne: CASE_EMBEDDING_TASK_TYPE } },
                { embeddingDimensions: { $exists: false } },
                { embeddingDimensions: { $ne: EMBEDDING_DIMENSIONALITY } },
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
                const vector = await generateEmbedding(searchText, { taskType: CASE_EMBEDDING_TASK_TYPE });
                caseItem.embedding = vector;
                caseItem.embeddingModel = EMBEDDING_MODEL;
                caseItem.embeddingTaskType = CASE_EMBEDDING_TASK_TYPE;
                caseItem.embeddingDimensions = vector.length;
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
