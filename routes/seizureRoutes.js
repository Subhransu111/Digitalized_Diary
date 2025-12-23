const express = require('express');
const router = express.Router();
const{createSeizure,getSeizuresByCase} = require('../controllers/SeizureController');

router.post('/', createSeizure);
router.get('/:caseId', getSeizuresByCase);

module.exports = router;