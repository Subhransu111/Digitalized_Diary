const express = require('express');
const router = express.Router();
const {createCaseFact,getFactsByCase} = require('../controllers/CaseFactController');

router.post('/casefact', createCaseFact);
router.get('/findcasefact/:caseId', getFactsByCase);

module.exports = router;