const mongoose = require('mongoose');
const validator = require('validator');
const bcryptjs = require('bcrypt');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  active: {
    type: Boolean,
    default: true,
    selected: false,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
  },
  name: {
    type: String,
    required: [true, 'Please provide a name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide email'],
    validate: [validator.isEmail, 'Please provide a vaid email'],
    unique: true,
    lowercase: true,
  },
  photo: { type: String, default: 'default.jpg' },
  password: {
    type: String,
    required: [true, 'Please provide password'],
    minlength: 8,
    maxlength: 16,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your Password'],

    // This only work on create and save
    validate: {
      validator: function (val) {
        return val === this.password;
      },
      message: 'Invalid confirm password',
    },
    select: false,
  },

  passwordChangeAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
});
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangeAt = Date.now() - 1000;
  // phải trừ 1s là do sẽ tạo ra token trước khi Date.now() được gọi ở trigger này.Để đảm bảo token được tạo sau khi đổi password thì phải lùi về 1s trước.
  next();
});

userSchema.pre('save', async function (next) {
  // only run this func if pass was modified
  // console.log('PRE: SAVE CALL');
  if (!this.isModified('password')) return next();
  // hash password with cost of 12
  this.password = await bcryptjs.hash(this.password, 10);
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcryptjs.compare(candidatePassword, userPassword);
};

userSchema.methods.changePasswordAfter = function (JWTTimestamp) {
  userSchema.methods.changePasswordAfter = function (JWTTimestamp) {
    let changedTimestamp;
    if (this.passwordChangeAt) {
      changedTimestamp = parseInt(this.passwordChangeAt.getTime() / 1000, 10);
      console.log(this.passwordChangeAt, JWTTimestamp);
    }
    return JWTTimestamp < changedTimestamp;
  };

  // 200 < 300 (tgian lấy token bé hơn thời gian đổi mật khẩu -> sau khi lấy token mới đổi mk )
  // 300 > 200 ( false -> notchange )
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  // console.log(
  //   'createPasswordResetToken',
  //   { resetToken },
  //   this.passwordResetToken
  // );
  return resetToken;
};
const User = mongoose.model('User', userSchema);
module.exports = User;
