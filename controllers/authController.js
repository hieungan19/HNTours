const { promisify } = require('util');
const User = require('./../model/userModel');
const jwt = require('jsonwebtoken');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');
// const { sendEmail } = require('../utils/email');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const multer = require('multer');
const Email = require('../utils/email');

//image processing

//save to disk
// const multerStorage = multer.diskStorage({
//   destination: (req, file, callbackFunction) => {
//     callbackFunction(null, 'public/img/users');
//   },
//   filename: (req, file, callbackFunction) => {
//     // user-<id>
//     //mimestyle (image/jpeg)- get jpeg
//     const ext = file.mimetype.split('/')[1];
//     callbackFunction(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, callbackFunction) => {
  //if upload file is an image
  if (file.mimetype.startsWith('image')) {
    callbackFunction(null, true);
  } else
    callbackFunction(
      new AppError('Not an image. Please upload only images'),
      false
    );
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single('photo');

//filtered out unwanted fields names that are not allowed to be updated
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

const createAndSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    httpOnly: true,
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token);
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);
  const url = `${req.protocol}://${req.get('host')}/me`;
  //console.log('URL: ' + url);
  const email = new Email(newUser, url);
  await email.sendWelcome();
  createAndSendToken(newUser, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // get token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies) {
    //console.log(req.cookies);
    token = req.cookies.jwt;
  }
  // //console.log('TOKEN: ', token);

  if (!token) {
    return next(
      new AppError('You are not logged in. Please log in to get access', 401)
    );
  }

  //2. verify token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // //console.log('AFTER DECODE: ', decoded);

  //3. Check if user still exist (nếu 1 tài khoản đăng nhập và lấy được token nhưng 1 thiết bị khác lại xóa tài khoản đó đi thì không thể nào xử lí trên token cũ đó được nữa)
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The token beloging to this user does no longer exist. ',
        401
      )
    );
  }

  // 4. check if user changed password after the token was issued
  if (currentUser.changePasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password!. Please login again. ', 401)
    );
  }

  //grant access to protected route
  req.user = currentUser;
  res.locals.user = currentUser;

  next();
});

exports.isLoggedIn = catchAsync(async (req, res, next) => {
  // get token and check of it's there
  let token;
  if (req.cookies.jwt) {
    //console.log(req.cookies);
    token = req.cookies.jwt;
    //2. verify token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    // //console.log('AFTER DECODE: ', decoded);

    //3. Check if user still exist (nếu 1 tài khoản đăng nhập và lấy được token nhưng 1 thiết bị khác lại xóa tài khoản đó đi thì không thể nào xử lí trên token cũ đó được nữa)
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next();
    }

    // 4. check if user changed password after the token was issued
    if (currentUser.changePasswordAfter(decoded.iat)) {
      return next();
    }

    //grant access to protected route
    res.locals.user = currentUser;
    return next();
  }
  next();
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //1. check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  //2. check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');
  const correct = await user.correctPassword(password, user.password);
  if (!user || !correct) {
    return next(new AppError('Incorrect email or password'), 401);
  }

  //3. ok
  createAndSendToken(user, 200, res);
});

exports.restrictTo = (...roles) => {
  //console.log(roles);
  return (req, res, next) => {
    //roles is an array ['admin', 'lead-guide']
    if (!roles.includes(req.user.role))
      return next(
        new AppError('You do not have permission to perform this action.')
      );
    next();
  };
};

exports.forgotPassword = exports.forgotPassword = catchAsync(
  async (req, res, next) => {
    // 1) Get user based on POSTed email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return next(new AppError('There is no user with email address.', 404));
    }

    // 2) Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save();

    //3. send it to user's email
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;

    try {
      // send email
      // await sendEmail({
      //   email: user.email,
      //   subject: 'Your password reset token (valid for 10 min)',
      //   message: message,
      // });
      await new Email(user, resetURL).sendForgotPasswordUrl();
      res.status(200).json({
        status: 'success',
        message: 'Token sent to email',
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      return next(
        new AppError('There was an error sending the mail. Try again later')
      );
    }
  }
);

exports.resetPassword = async function (req, res, next) {
  //1. Get user base on the token
  //console.log(req.params.token);
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  //console.log(hashedToken);

  const user = await User.findOne({
    passwordResetToken: hashedToken,
  });

  //2. If token has not expired, there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  user.password = req.body.password;

  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetExpires = undefined;
  user.passwordResetToken = undefined;
  await user.save();

  //3. Update changedPasswordAt
  //4. Log the user in, send JWT
  createAndSendToken(user, 200, res);
};

exports.updatePassword = async (req, res, next) => {
  const user = await User.findById({ _id: req.user.id }).select('+password');

  //console.log(user);
  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(AppError('Your current password is wrong. ', 400));
  }

  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  //user find by id and update will not work as intended.

  createAndSendToken(user, 200, res);
};

exports.updateUserData = catchAsync(async (req, res, next) => {
  //console.log(req.file);
  //console.log(req.body);
  if (
    req.body.currentPassword ||
    req.body.newPassword ||
    req.body.password ||
    req.body.passwordConfirm
  ) {
    return next(
      new AppError(
        'This route is not for password update. Please use /updatePassword',
        400
      )
    );
  }
  const filteredBody = filterObj(req.body, 'name', 'email');
  if (req.file) filteredBody.photo = req.file.filename;
  const updateUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    data: {
      updateUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(200).json({
    status: 'success',
    data: 'null',
  });
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'empty', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};
