const catchAsync = require("../utils/catchAsync");
const Users = require('./../models/userModel');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/apiError');
const { promisify } = require('util'); 
const sendEmail = require('./../utils/email');
const crypto = require('crypto');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const createSendToken = (user, statusCode, res) => {

  const token = signToken(user._id);
    const cookieOptions = {
        expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
    };
    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

    res.cookie('jwt', token, cookieOptions);

    // Remove password from output
    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
};



exports.signup = catchAsync(async(req ,res ,next) => {
    const newUser = await Users.create({
        name: req.body.name,
        email:req.body.email,
        password:req.body.password,
        passwordConfirm:req.body.passwordConfirm
    });
    // const token = signToken(newUser._id);
    // res.status(201).json({
    //     status:'created',
    //     token,
    //     data:{
    //         users: newUser
    //     }
    // })
    createSendToken(newUser, 201, res);
})

exports.Login = catchAsync(async(req ,res ,next) => {
    
    const {email , password} = req.body;

    if (!email || !password) {
        return next(new AppError('Please provide email and password!', 400));
    }

    const user = await Users.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password', 401));
    }
    // const token = signToken(user._id);
    // res.status(200).json({
    //     status:'success',
    //     token,
    //     data:{
    //         users: user
    //     }
    // })
    createSendToken(user, 200, res);
})

exports.Protect = catchAsync(async(req,res,next)=>{

    let token;
    if ( req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    }
    console.log("token" , token)
    if(!token){
        return next(new AppError('You are not logged in ! Please log in to get access.',401))
    }

     // 2) Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Check if user still exists
    const currentUser = await Users.findById(decoded.id);
    if (!currentUser) {
        return next(
        new AppError(
            'The user belonging to this token does no longer exist.',
            401
        )
        );
    }

    // 4) Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(
        new AppError('User recently changed password! Please log in again.', 401)
        );
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    next();
})

exports.restrictTo = (...roles) =>{
    return (req ,res , next) =>{
        if (!roles.includes(req.user.role)) {
            return next(
                new AppError('You do not have permission to perform this action', 403)
            );
        }
        next();
    }
}

exports.forgotPassword = catchAsync(async (req , res , next) =>{
    const user = await Users.findOne({email:req.body.email});
    if (!user) {
        return next(new AppError('There is no user with email address.', 404));
    }
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    const resetURL = `${req.protocol}://${req.get('host')}/app/v1/users/resetPassword/${resetToken}`;
    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

    try {
        await sendEmail({
            email:user.email,
            subject: 'Your password reset token (valid for 10 min)',
            message
        })
        res.status(200).json({
            status: 'success',
            message: 'Token sent to email!'
        });
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return next(
        new AppError('There was an error sending the email. Try again later!'),
        500
        );
    }
    
})

exports.resetPassword =  catchAsync( async (req,res,next)=>{
    const hashToken =  crypto.createHash('sha256').update(req.params.token).digest('hex');
    console.log("hashToken" , hashToken)
    const user = await Users.findOne({passwordResetToken:hashToken ,passwordResetExpires: { $gt: Date.now() }});

    if(!user){
        return next(new AppError('Token is invalid or has expired', 400));
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // 3) Update changedPasswordAt property for the user
    // 4) Log the user in, send JWT
    createSendToken(user, 200, res);
})

exports.updatePassword = catchAsync( async (req,res,next) =>{
    const user = await Users.findById(req.user.id).select('+password');
    if(!(await user.correctPassword(req.body.passwordCurrent , user.password))){
        return next(new AppError('Password is incorrect', 401));
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    createSendToken(user, 200, res);

})