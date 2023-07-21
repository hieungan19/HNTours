const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getMe,
  resizeUserPhoto,
} = require('../controllers/userController');
const {
  signUp,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
  protect,
  updateUserData,
  deleteMe,
  restrictTo,
  logout,
  uploadUserPhoto,
} = require('../controllers/authController');
const { getOneById } = require('../handler/factoryHandler');

router.post('/signup', signUp);
router.post('/login', login);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

// su dung middleware protect cho tat ca nhung middleware sau do
router.use(protect);
router.get('/logout', logout);
router.patch('/updatePassword', updatePassword);
router.patch('/updateData', uploadUserPhoto, resizeUserPhoto, updateUserData);
router.delete('/deleteMe', deleteMe);

router.get('/me', getMe, getUser);

router.use(restrictTo('admin'));
router.route('/').get(getAllUsers);
router.route('/:id').patch(updateUser).delete(deleteUser).get(getUser);

module.exports = router;
