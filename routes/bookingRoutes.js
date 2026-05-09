const express = require('express');

const {Protect , restrictTo } = require('./../controller/authController')
const bookingController = require('./../controller/bookingController');
const router = express.Router();


router.use(Protect);

router.get('/checkout-session/:tourId', bookingController.getCheckoutSession);

router.use(restrictTo('admin', 'lead-guide'));
router
  .route('/')
  .get(bookingController.getAllBookings)
  .post(bookingController.createBooking);

router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);


module.exports = router;