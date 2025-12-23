const express = require('express');
const router = express.Router();
const {createCase,getCases,updateCaseStatus} = require('../controllers/caseController');

router.post('/', createCase);
router.get('/', getCases);
router.patch('/:id', updateCaseStatus);

module.exports = router;