const User = require('./../model/userModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('../handler/factoryHandler');
const sharp = require('sharp');
exports.getAllUsers = factory.getAll(User);
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'fail',
    message: 'This route is not yet defined',
  });
};
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
exports.getUser = factory.getOneById(User);
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  //console.log('FILE NAME: ' + req.file.filename);
  await sharp(req.file.buffer)
    .resize(500, 500)
    .jpeg({ quality: 100 })
    .toFile(`public/img/users/${req.file.filename}`);
  next();
});
