const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  addComment,
  getComments,
} = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .post(addComment)
  .get(getComments);

module.exports = router;
