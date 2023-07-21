const express = require('express');
const router = express.Router({ mergeParams: true });
const { protect, restrictTo } = require('../controllers/authController');
const {
  getAllReviews,
  createReview,
  getReview,
  deleteReview,
  updateReview,
} = require('../controllers/reviewController');
router.use(protect);
router
  .route('/')
  .get(getAllReviews)
  .post(protect, restrictTo('user'), createReview);

router
  .route('/:id')
  .get(getReview)
  .delete(restrictTo('admin', 'user'), deleteReview)
  .patch(updateReview);

module.exports = router;
