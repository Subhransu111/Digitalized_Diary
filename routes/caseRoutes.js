const express = require('express');
const router = express.Router();
const {createCase,getCases} = require('../controllers/caseController');

router.post('/case', createCase);
router.get('/cases', getCases);

module.exports = router;