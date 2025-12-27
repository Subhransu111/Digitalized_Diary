const express = require('express');
const router = express.Router();
const {getCaseStatistics,getFIRtoChargeSheetTimeline,checkDeadlines} = require('../controllers/analyticsController');


router.get('/stats', getCaseStatistics);
router.get('/timeline', getFIRtoChargeSheetTimeline);
router.get('/reminders', checkDeadlines);
module.exports = router;