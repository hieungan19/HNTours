const AppError = require('../utils/appError');
const sendErrorDev = (err, req, res) => {
  // //console.log(err.stack);
  //console.log(req.originalUrl);
  // api
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      error: err,
      status: err.status,
      message: err.message,
      stack: err.stack,
    });
  } else {
    //web
    res.status(err.statusCode).render('error', {
      title: 'Something went wrong.',
      msg: err.message,
    });
  }
};

const sendErrorProduct = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    } else {
      console.error('Error 💥 ', err);
      return res.status(500).json({
        status: 'error',
        message: err.message,
      });
    }
  }

  //render web
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      msg: err.message,
    });
  } else {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      msg: 'Please try again later',
    });
  }
};
const handleCastErrorDB = (err) => {
  return new AppError(`Invalid ${err.path}: ${err.value}`, 400);
};
const handleValidError = (err) => {
  // //console.log('handleValidationErrorDB');
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data. ${errors.join('.')}`;
  return new AppError(message, 400);
};

const handleJWTError = (err) => {
  return new AppError('Invalid token. Please login again. ', 401);
};
const handleTokenExpiredError = (err) =>
  new AppError('JWT expired. Please login again', 401);

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else {
    if (err.name === 'ValidationError') err = handleValidError(err);
    if (err.name === 'CastError') err = handleCastErrorDB(err);
    if (err.name === 'JsonWebTokenError') err = handleJWTError(err);
    if (err.name === 'TokenExpiredError') err = handleTokenExpiredError(err);
    sendErrorProduct(err, req, res);
  }
  // res.status(err.statusCode).json({
  //   status: err.status,
  //   message: err.message,
  // });
};
