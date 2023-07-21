const express = require('express');
const router = express.Router();
const { protect, isLoggedIn } = require('../controllers/authController');
const {
  getOverview,
  getTour,
  login,
  getAccount,
  updateUserData,
  getMyTours,
} = require('../controllers/viewController');
const { createBookingCheckout } = require('../controllers/bookingController');

// router.get('/', protect, getOverview);
router.get('/', createBookingCheckout, isLoggedIn, getOverview);

router.get('/tour/:slug', isLoggedIn, getTour);

router.get('/login', isLoggedIn, login);
router.get('/me', protect, getAccount);
router.post('/submit-user-data', protect, updateUserData);
router.get('/my-tours', protect, getMyTours);
module.exports = router;
