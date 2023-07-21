const Tour = require('../model/tourModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeature = require('../utils/apiFeatures');
const factory = require('../handler/factoryHandler');
const multer = require('multer');
const sharp = require('sharp');
//process image
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

exports.uploadTourImages = upload.fields([
  {
    name: 'imageCover',
    maxCount: 1,
  },
  {
    name: 'images',
    maxCount: 3,
  },
]);
// upload.array('images',3)

//resize
exports.resizeTourImages = catchAsync(async (req, res, next) => {
  // //console.log(req.files);
  if (!req.files.imageCover || !req.files.images) return next();

  // cover image
  const imageCoverFileName = `tour-${req.params.id}-${Date.now()}-cover`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1400)
    .jpeg({ quality: 100 })
    .toFile(`public/img/tours/${imageCoverFileName}`);

  req.body.imageCover = imageCoverFileName;

  //images
  req.body.images = [];

  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i}`;
      await sharp(req.files.images[i].buffer)
        .resize(500, 500)
        .jpeg({ quality: 100 })
        .toFile(`public/img/tours/${filename}`);
      req.body.images.push(filename);
    })
  );
  //console.log(req.body.images);
  next();
});
//Check if name is exist

// exports.checkBody = (req, res, next) => {
//   if (!req.body.name)
//     return res.status(400).json({
//       status: 'fail',
//       message: 'Missing name',
//     });
//   next();
// };

exports.aliasTopFiveTours = (req, res, next) => {
  req.query.page = '1';
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,sumary';
  next();
};

exports.getAllTours = factory.getAll(Tour);

//USING CATCH ASYNC
exports.getTour = factory.getOneById(Tour, { path: 'reviews' });
// });  catch (err) {
//   res.status(400).json({
//     status: 'fail',
//     message: err,
//   });
// }
// const tour = tours.find((el) => el.id === id);
// res.status(200).json({
//   status: 'success',
//   // data: {
//   //   tour,
//   // },
// });

exports.createTour = factory.createOne(Tour);

// Get new tour and add into tours

// const newId = tours[tours.length - 1].id + 1;
// const newTour = Object.assign({ id: newId }, req.body);
// tours.push(newTour);

// write new tour into file
// fs.writeFile(
//   `${__dirname}/dev-data/data/tours-simple.json`,
//   JSON.stringify(tours),
//   (err) => {
//     res.status(201).json({
//       status: 'success',
//       data: {
//         tour: newTour,
//       },
//     });
//   }
// );

exports.updateTour = factory.updateOne(Tour);
//using factory
exports.deleteTour = factory.deleteOne(Tour);

exports.getGroupTours = async (req, res) => {
  try {
    const groupTour = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          _id: { $toUpper: '$difficulty' },
          numTours: { $sum: 1 },
          numRatings: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: 'price' },
          maxPrice: { $max: '$price' },
        },
      },
      { $sort: { avgPrice: 1 } },
      { $match: { _id: { $ne: 'EASY' } } },
    ]);
    res.status(200).json({
      status: 'success',
      data: groupTour,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getMonthlyPlan = async (req, res) => {
  try {
    // //console.log(req.params.year);
    const year = req.params.year * 1;
    // //console.log(year);
    const plan = await Tour.aggregate([
      { $unwind: '$startDates' },
      // { $unwind: '$images' },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numTourStarts: { $sum: 1 },
          tours: { $push: '$name' },
        },
      },
      {
        $addFields: {
          month: '$_id',
        },
      },
      {
        $sort: {
          numTourStarts: -1,
        },
      },
      {
        $project: {
          _id: 0,
        },
      },
    ]);
    res.status(200).json({
      status: 'success',
      data: plan,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};
exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  //console.log(latlng);
  const [lat, lng] = latlng.split(',');
  //console.log(distance, lat, lng, unit);
  if (!lat || !lng) {
    return next(
      new AppError(
        'Please provide latidude and longtitude in the format: lat, lng.',
        400
      )
    );
  }
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    status: 'success',
    result: tours.length,
    data: {
      tours,
    },
  });
});

exports.getDistance = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  if (!lat || !lng) {
    return next(
      new AppError(
        'Please provide latidude and longtitude in the format: lat, lng.',
        400
      )
    );
  }
  const multiplier = unit == 'mi' ? 0.00062 : 0.001;
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        //specify near: which calculate
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        name: 1,
        distance: 1,
      },
    },
  ]);
  res.status(200).json({
    status: 'success',
    result: distances.length,
    data: {
      distances,
    },
  });
});
