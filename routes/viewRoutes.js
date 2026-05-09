const express = require('express');
const router = express.Router();
const viewsController = require('./../controller/viewController');
const authController = require('./../controller/authController');
const bookingController = require('./../controller/bookingController');



router.get('/' , bookingController.createBookingCheckout ,authController.isLoggedIn, viewsController.getOverview )
router.get('/tour/:slug' ,authController.isLoggedIn , viewsController.getTour );
router.get('/login',authController.isLoggedIn, viewsController.getLoginForm);
router.get('/me', authController.Protect, viewsController.getAccount);
router.get('/my-tours', authController.Protect, viewsController.getMyTours);


module.exports = router;  