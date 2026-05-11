
const express = require('express');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const morgan = require('morgan');
const AppError = require('./utils/apiError')
const globalErrorHandler = require('./controller/errorController');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const app = express();
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const path = require('path');
const cookieParser = require('cookie-parser');

app.set('trust proxy', 1);
app.set('view engine' , 'pug');
app.set('views' , path.join(__dirname , 'views'));
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));
// app.get('/' , (req , res)=>{
//   res.status(200).render('base');
// })


// .1) Middleware
// app.use(helmet());
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/app', limiter);

app.use(express.json());
if(process.env.NODE_ENV == 'development'){
    app.use(morgan('dev'));
}

// app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());


app.use((req,res,next)=>{
    req.requestTime = new Date().toISOString();
    next();
})

app.use(mongoSanitize());
app.use(xss());

app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);


// app.get('/app/v1/tours', getAllTours);
// app.post('/app/v1/tours',createTour);
// app.get('/app/v1/tours/:id',getTour);
// app.patch('/app/v1/tours/:id',updateTour);
// app.delete('/app/v1/tours/:id',deleteTour);

app.use('/',viewRouter);
app.use('/app/v1/tours',tourRouter);
app.use('/app/v1/users',userRouter);
app.use('/app/v1/reviews',reviewRouter);
app.use('/app/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});


app.use(globalErrorHandler);
module.exports = app;