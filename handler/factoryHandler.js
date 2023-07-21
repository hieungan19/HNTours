const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeature = require('../utils/apiFeatures');
exports.deleteOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    const item = await Model.findByIdAndDelete(req.params.id);

    if (!item) {
      return next(new AppError('No item found with that ID', 404));
    }
    res.status(200).json({
      status: 'success',
      data: null,
    });
  });
};
exports.updateOne = (Model) => {
  return catchAsync(async (req, res) => {
    const data = await Model.findByIdAndUpdate(req.params.id, req.body, {
      runValidators: true,
      new: true,
    });
    res.status(200).json({
      status: 'success',
      data: {
        data,
      },
    });
  });
};
exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    // const newTour = new Tour({});
    // newTour.save();

    const data = await Model.create(req.body);
    res.status(200).json({
      status: 'success',
      data: {
        data,
      },
    });
  });
exports.getOneById = (Model, populatOptions) => {
  return catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (populatOptions) query = query.populate(populatOptions);
    const data = await query;
    if (!data) {
      return next(new AppError('No item found with that ID'));
    }
    res.status(200).json({
      status: 'success',
      data: {
        data,
      },
    });
  });
};

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    // Allow for nested get reviews
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    const features = new APIFeature(Model.find(filter), req.query)
      .filter()
      .sort()
      .pagination();
    const doc = await features.query; //.explain
    if (!doc) return next(new AppError('Error when get all', 500));
    res.status(200).json({
      status: 'success',
      length: doc.length,
      data: {
        doc,
      },
    });
  });
