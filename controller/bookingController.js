const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/apiError')
const factory = require('./handleFactory');
const Booking = require('./../models/bookingModel');



exports.getCheckoutSession = catchAsync ( async (req , res , next) =>{
   const tour =  await Tour.findById(req.params.tourId);

   const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
    // success_url: `${req.protocol}://${req.get('host')}/`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,

    customer_email: req.user.email,

    line_items: [
        {
        price_data: {
            currency: 'usd',
            unit_amount: tour.price * 100,

            product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [
                `${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`
            ]
            }
        },

        quantity: 1
        }
    ]
    });

  // 3) Create session as response
  res.status(200).json({
    status: 'success',
    session
  });


})


exports.createBookingCheckout = catchAsync( async (req , res , next) => {
  const {tour, user, price } = req.query;
  if(!tour && !user && !price) return next();
  await Booking.create({ tour, user, price });

  res.redirect(req.originalUrl.split('?')[0])
});


exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
