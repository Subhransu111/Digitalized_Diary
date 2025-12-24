const express = require('express');
const router = express.Router();
const {createEvidenceLog,getEvidenceLogsByCase} = require('../controllers/evidenceLogController');
const upload = require('../middlware/fileUpload');

router.post('/', upload.single('evidenceFile'), createEvidenceLog);
router.get('/:caseId', getEvidenceLogsByCase);

module.exports = router;