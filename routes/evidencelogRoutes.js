const express = require('express');
const router = express.Router();
const {createEvidenceLog,getEvidenceLogsByCase} = require('../controllers/evidenceLogController');

router.post('/', createEvidenceLog);
router.get('/:caseId', getEvidenceLogsByCase);

module.exports = router;