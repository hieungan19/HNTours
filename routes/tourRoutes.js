const express = require('express');
const router = express.Router();
const reviewRouter = require('./reviewRoutes');
const {
  getAllTours,
  getTour,
  createTour,
  deleteTour,
  updateTour,
  checkID,
  checkBody,
  aliasTopFiveTours,
  getGroupTours,
  getMonthlyPlan,
  getToursWithin,
  getDistance,
  uploadTourImages,
  resizeTourImages,
} = require('../controllers/tourController');
const { createReview } = require('../controllers/reviewController');
const { protect, restrictTo } = require('../controllers/authController');
// router.param('id', checkID);
router
  .route('/monthly-plan/:year')
  .get(protect, restrictTo('admin', 'lead-guide', 'guide'), getMonthlyPlan);
router.route('/group-tours').get(getGroupTours);
router.route('/top-5-cheap').get(aliasTopFiveTours, getAllTours);

router.route('/distances/:latlng/unit/:unit').get(getDistance);

router
  .route('/tour-within/:distance/center/:latlng/unit/:unit')
  .get(getToursWithin);
// router.route('/').get(getAllTours).post(checkBody, createTour);
router
  .route('/')
  .get(protect, getAllTours)
  .post(protect, restrictTo('admin', 'lead-guide'), createTour);
router
  .route('/:id')
  .get(getTour)
  .patch(
    protect,
    restrictTo('admin', 'lead-guide'),
    uploadTourImages,
    resizeTourImages,
    updateTour
  )
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);

router.use('/:tourId/reviews', reviewRouter);
module.exports = router;
