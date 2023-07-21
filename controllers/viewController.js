const Tour = require('../model/tourModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const User = require('../model/userModel');
const Booking = require('../model/bookingModel');
exports.getOverview = catchAsync(async (req, res) => {
  //get tours from collection
  const tours = await Tour.find();
  //build template

  //render that template using data from collection
  res.status(200).render('overview', {
    title: 'All tours',
    tours,
  });
});
exports.getTour = catchAsync(async (req, res) => {
  // get the data, for the requested tour
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  if (!tour) {
    return next(new AppError('There is no tour with that name. ', 400));
  }

  // build template

  // render template using data from m1
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
  });
});
exports.login = catchAsync(async (req, res) => {
  res.status(200).render('login', {
    title: `Login`,
  });
});

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: `Your account`,
  });
};
exports.updateUserData = async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(200).render('account', {
    title: `Your account`,
    user: updatedUser,
  });
};

exports.getMyTours = async (req, res, next) => {
  //console.log('Hello from bookings');
  //find all bookings
  const bookings = await Booking.find({ user: req.user.id });
  const tourIDs = bookings.map((el) => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIDs } });

  res.status(200).render('overview', {
    title: 'My tours',
    tours,
  });
};
