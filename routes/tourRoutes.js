const express = require('express');
const {getAllTours , createTour , getTour , updateTour , deleteTour , checkId , checkBody , aliasTopTours , tourStats ,getMonthlyPlan} = require('./../controller/tourController');
const {Protect , restrictTo} = require('./../controller/authController');
const {createReview } = require('./../controller/reviewController');
const reviewRouter = require('./reviewRoutes');
const router = express.Router()

// router.param('id', checkId)
router.use('/:tourId/reviews' , reviewRouter);
router.route('/top-stats').get(tourStats)
router.route('/top-5-cheap').get(aliasTopTours , getAllTours)
router.route('/monthly-plan/:year').get(getMonthlyPlan);
router.route('/').get(Protect , getAllTours).post(createTour);
router.route('/:id').get(getTour).patch(updateTour).delete(Protect , restrictTo('admin', 'lead-guide') ,deleteTour);
// router.route('/:tourId/review').post(Protect , createReview);

module.exports = router;