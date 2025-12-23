const express = require('express');
const router = express.Router();
const {createwitnessStatement,getWitnessByCase} = require('../controllers/witnessController');

router.post('/witness', createwitnessStatement);
router.get('/findwitness/:caseId', getWitnessByCase);

module.exports = router;