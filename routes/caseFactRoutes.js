const express = require('express');
const router = express.Router();
const {createCaseFact,getFactsByCase} = require('../controllers/CaseFactController');

router.post('/', createCaseFact);
router.get('/:caseId', getFactsByCase);

module.exports = router;