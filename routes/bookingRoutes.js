const express = require('express');
const bookingController = require('../controllers/bookingController');
const router = express.Router();
const authController = require('../controllers/authController');
const { route } = require('./reviewRoutes');
router.use(authController.protect);
router.get(
  '/checkout-session/:tourId',
  authController.protect,
  bookingController.getCheckoutSession
);
router.use(authController.restrictTo('admin', 'lead-guide'));
router
  .route('/')
  .get(bookingController.getAllBooking)
  .post(bookingController.createBooking);
router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);
module.exports = router;
