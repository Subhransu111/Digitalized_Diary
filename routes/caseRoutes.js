const express = require('express');
const router = express.Router();
const {createCase,getCases,getCaseById,updateCaseStatus} = require('../controllers/caseController');

router.post('/', createCase);
router.get('/', getCases);
router.get('/:id', getCaseById);
router.patch('/:id', updateCaseStatus);

module.exports = router;