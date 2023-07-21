const Tour = require('../model/tourModel');
const catchAsync = require('../utils/catchAsync');
const Booking = require('../model/bookingModel');
const factory = require('../handler/factoryHandler');
// const Stripe = require('stripe');
// const stripePublicKey = new Stripe(
//   'pk_test_51NVstGD8Eqr8VvMxpZk4tnwaM5xIOMktgft1RAV5sW7p4N4Olkk3EDsUlAGyi68DqjSAgF6Ng4XXRDOUQ5d4TcHH00VVLQBhfx'
// );
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Stripe = require('stripe');
const stripePublicKey = new Stripe(
  'pk_test_51NVstGD8Eqr8VvMxpZk4tnwaM5xIOMktgft1RAV5sW7p4N4Olkk3EDsUlAGyi68DqjSAgF6Ng4XXRDOUQ5d4TcHH00VVLQBhfx'
);

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

  //1. Get the current booked tour
  const tour = await Tour.findById(req.params.tourId);
  console.log(tour);

  //Create customer
  // const customer = await stripe.customers.create({
  //   email: 'customer@example.com',
  // });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    client_reference_id: req.params.tourId,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${tour.name} Tour`, // Change this to your product name
            // Other product details can be added here
          },
          unit_amount: tour.price * 100, // Change this to the actual amount in cents
        },
        quantity: 1, // Change this to the desired quantity of the product
      },
    ],
    mode: 'payment',
    success_url: `${req.protocol}://${req.get('host')}/?tour=${
      req.params.tourId
    }&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/?tour=${
      req.params.tourId
    }&user=${req.user.id}&price=${tour.price}`,
    customer_email: req.user.email,
  });

  //2. Create checkout session

  // Create session as response
  res.status(200).json({
    status: 'success',
    session,
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  //This is only temporaty. Everyone can make booking without paying.
  const { tour, user, price } = req.query;
  console.log(tour, user, price);
  if (!tour || !user || !price) return next();
  await Booking.create({ tour, user, price });
  console.log(req.originalUrl.split('?')[0]);
  // req.redirect(req.originalUrl.split('?')[0]);
  next();
});
exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOneById(Booking);
exports.getAllBooking = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
