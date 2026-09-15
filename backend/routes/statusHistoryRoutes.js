const express = require('express');
const router = express.Router({ mergeParams: true });
const { getTicketHistory } = require('../controllers/statusHistoryController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getTicketHistory);

module.exports = router;
