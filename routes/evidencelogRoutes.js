const express = require('express');
const router = express.Router();
const {createEvidenceLog,getEvidenceLogsByCase,validateEvidenceUpload} = require('../controllers/evidenceLogController');
const upload = require('../middlware/fileUpload');

router.post('/', upload.single('evidenceFile'), createEvidenceLog);
router.get('/:caseId', getEvidenceLogsByCase);
router.post('/validate',upload.single('evidenceFile'),validateEvidenceUpload);

module.exports = router;