const express = require('express');
const router = express.Router();
const {createCase,getCases} = require('../controllers/caseController');

router.post('/', createCase);
router.get('/', getCases);

module.exports = router;