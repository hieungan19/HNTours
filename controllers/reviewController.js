const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Review = require('../model/reviewModel');
const factory = require('../handler/factoryHandler');
exports.getAllReviews = factory.getAll(Review);

exports.createReview = catchAsync(async (req, res, next) => {
  const user = req.user;
  req.body.user = user._id;
  if (req.params.tourId) req.body.tour = req.params.tourId;
  const newReview = await Review.create(req.body);
  res.status(200).json({
    status: 'success',
    data: {
      newReview,
    },
  });
});

exports.getReview = factory.getOneById(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);
