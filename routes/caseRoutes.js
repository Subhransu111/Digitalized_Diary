const express = require('express');
const router = express.Router();
const {
    createCase,
    getCases,
    getCaseById,
    updateCaseStatus,
    extractCaseData,
    semanticSearchCases,
} = require('../controllers/caseController');
const uploadEvidence = require('../middlware/uploadMiddleware');

router.post('/extract', extractCaseData);
router.post('/semantic-search', semanticSearchCases);
router.post('/', uploadEvidence.array('evidenceFiles', 5), createCase);
router.get('/', getCases);
router.get('/:id', getCaseById);
router.patch('/:id', updateCaseStatus);

module.exports = router;
