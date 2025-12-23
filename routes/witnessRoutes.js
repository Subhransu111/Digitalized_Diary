const express = require('express');
const router = express.Router();
const {createwitnessStatement,getWitnessByCase} = require('../controllers/witnessController');

router.post('/', createwitnessStatement);
router.get('/:caseId', getWitnessByCase);

module.exports = router;