const express = require('express');
const router = express.Router();
const {createEvidenceLog,getEvidenceLogsByCase} = require('../controllers/evidenceLogController');

router.post('/evidencelog', createEvidenceLog);
router.get('/findevidencelog/:caseId', getEvidenceLogsByCase);

module.exports = router;