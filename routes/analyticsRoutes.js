const express = require('express');
const router = express.Router();
const {getCaseStatistics,getFIRtoChargeSheetTimeline} = require('../controllers/analyticsController');

router.get('/stats', getCaseStatistics);
router.get('/timeline', getFIRtoChargeSheetTimeline);

module.exports = router;