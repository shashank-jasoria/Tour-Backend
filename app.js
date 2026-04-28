
const express = require('express');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes')
const morgan = require('morgan');
const AppError = require('./utils/apiError')
const globalErrorHandler = require('./controller/errorController');

const app = express();

// .1) Middleware

app.use(express.json());
if(process.env.NODE_ENV == 'development'){
    app.use(morgan('dev'));
}
app.use(express.static(`${__dirname}/public`));
app.use((req,res,next)=>{
    console.log("message from the middleware");
    next();
});
app.use((req,res,next)=>{
    req.requestTime = new Date().toISOString();
    next();
})


// app.get('/app/v1/tours', getAllTours);
// app.post('/app/v1/tours',createTour);
// app.get('/app/v1/tours/:id',getTour);
// app.patch('/app/v1/tours/:id',updateTour);
// app.delete('/app/v1/tours/:id',deleteTour);


app.use('/app/v1/tours',tourRouter);
app.use('/app/v1/users',userRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});


app.use(globalErrorHandler);
module.exports = app;