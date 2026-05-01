const review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handleFactory');


exports.setTourUserIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.getAllReviews = factory.getAll(review);
exports.getReview = factory.getOne(review);
exports.createReview = factory.createOne(review);
exports.updateReview = factory.updateOne(review);
exports.deleteReview = factory.deleteOne(review);
