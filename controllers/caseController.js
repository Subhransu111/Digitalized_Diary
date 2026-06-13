const Case = require('../models/Case');
const fs = require('fs');
const path = require('path');
const {
    extractCaseDetails,
    generateEmbedding,
    EMBEDDING_MODEL,
} = require('../services/geminiService');
const cosineSimilarity = require('../utils/cosineSimilarity');

const evidenceUploadDir = path.resolve(__dirname, '../uploads/evidence');
const CASE_EMBEDDING_TASK_TYPE = 'RETRIEVAL_DOCUMENT';
const QUERY_EMBEDDING_TASK_TYPE = 'RETRIEVAL_QUERY';

function buildSearchText(caseNumber, caseTitle, caseDescription) {
    return [
        `Number: ${caseNumber || ''}`,
        `Title: ${caseTitle || ''}`,
        `Description: ${caseDescription || ''}`,
    ].join(' | ');
}

function mapEvidenceFiles(files = []) {
    return files.map((file) => ({
        filename: file.filename,
        originalName: file.originalname,
        path: `/uploads/evidence/${file.filename}`,
        mimetype: file.mimetype,
        size: file.size,
    }));
}

function cleanupUploadedFiles(files = []) {
    files.forEach((file) => {
        if (!file?.path) return;

        const resolvedPath = path.resolve(file.path);
        const isInsideEvidenceDir =
            resolvedPath === evidenceUploadDir || resolvedPath.startsWith(`${evidenceUploadDir}${path.sep}`);

        if (!isInsideEvidenceDir) return;

        try {
            fs.unlinkSync(resolvedPath);
        } catch (error) {
            console.error('Failed to remove orphaned case evidence file:', error.message);
        }
    });
}

// Cretae a new Case
async function createCase(req, res) {
    try {
        const { caseNumber, caseTitle, caseDescription, caseStatus, createdBy } = req.body;

        if (!caseNumber || !caseTitle || !caseDescription) {
            cleanupUploadedFiles(req.files);
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields",
            });
        }

        const searchText = buildSearchText(caseNumber, caseTitle, caseDescription);
        let embedding = [];

        try {
            embedding = await generateEmbedding(searchText, { taskType: CASE_EMBEDDING_TASK_TYPE });
        } catch (embedError) {
            console.error('Non-blocking embedding error:', embedError.message);
        }

        const newCase = await Case.create({
            caseNumber,
            caseTitle,
            caseDescription,
            caseStatus: caseStatus || 'Open',
            createdBy: createdBy || 'System',
            evidenceFiles: mapEvidenceFiles(req.files),
            embedding,
            embeddingModel: embedding.length ? EMBEDDING_MODEL : '',
            embeddingTaskType: embedding.length ? CASE_EMBEDDING_TASK_TYPE : '',
            embeddingDimensions: embedding.length,
            searchText,
        });

        return res.status(201).json({
            success: true,
            message: "Case created successfully",
            data: newCase,
        });

    }
    catch (error) {
        cleanupUploadedFiles(req.files);
        console.error("Case Creation Failed:", error);
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    };
};

// Get all Cases

async function getCases(req, res) {
    try {
        const cases = await Case.find({});
        return res.status(200).json({
            success: true,
            data: cases,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message,
        });

    }
};

// Get Case by id
async function getCaseById(req, res) {
    try {
        const caseId = req.params.id;
        const caseData = await Case.find({ _id: caseId });
        return res.status(200).json({
            success: true,
            data: caseData,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }


}

async function updateCaseStatus(req, res) {
    try {
        const { id } = req.params;
        const { caseStatus } = req.body;
        const updatedCase = await Case.findByIdAndUpdate(
            id,
            { caseStatus },
            { new: true }
        );
        if (!updatedCase) {
            return res.status(404).json({
                success: false,
                message: "Case not found",
            });
        }
        return res.status(200).json({
            success: true,
            message: "Case status updated successfully",
            data: updatedCase,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

async function extractCaseData(req, res) {
    try {
        const { caseText } = req.body;

        if (!caseText) {
            return res.status(400).json({
                success: false,
                message: "Case narrative text is required.",
            });
        }

        if (caseText.trim().length < 20) {
            return res.status(400).json({
                success: false,
                message: "Case narration is too short. Please provide at least 20 characters.",
            });
        }

        const extractedData = await extractCaseDetails(caseText.trim());

        return res.status(200).json({
            success: true,
            message: "Details extracted successfully",
            data: extractedData,
        });
    } catch (error) {
        console.error("Extraction Endpoint Error:", error);
        return res.status(500).json({
            success: false,
            message: "AI extraction failed. Please fill the fields manually.",
            error: error.message,
        });
    }
}

async function semanticSearchCases(req, res) {
    try {
        const { query } = req.body;

        if (!query || query.trim().length < 3) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid search query of at least 3 characters.",
            });
        }

        const queryEmbedding = await generateEmbedding(query.trim(), { taskType: QUERY_EMBEDDING_TASK_TYPE });
        const cases = await Case.find({
            embedding: { $exists: true, $ne: [] },
            embeddingModel: EMBEDDING_MODEL,
            embeddingTaskType: CASE_EMBEDDING_TASK_TYPE,
            embeddingDimensions: queryEmbedding.length,
        }).lean();

        const threshold = 0.45;
        const results = cases
            .map((caseItem) => ({
                case: caseItem,
                score: cosineSimilarity(queryEmbedding, caseItem.embedding),
            }))
            .filter((result) => result.score >= threshold)
            .sort((a, b) => b.score - a.score)
            .slice(0, 10)
            .map((result) => ({
                ...result,
                score: Number(result.score.toFixed(4)),
            }));

        return res.status(200).json({
            success: true,
            results,
        });
    } catch (error) {
        console.error("Semantic Search Failure:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to process semantic query. Please fall back to basic listings.",
            error: error.message,
        });
    }
}

module.exports = {
    createCase,
    getCases,
    getCaseById,
    updateCaseStatus,
    extractCaseData,
    semanticSearchCases,
};
