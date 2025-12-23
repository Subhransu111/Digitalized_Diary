const express = require('express');
const router = express.Router();
const{createSeizure,getSeizuresByCase} = require('../controllers/SeizureController');

router.post('/seizure', createSeizure);
router.get('/findseizure/:caseId', getSeizuresByCase);

module.exports = router;