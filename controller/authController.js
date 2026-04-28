const catchAsync = require("../utils/catchAsync");
const Users = require('./../models/userModel');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/apiError');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

exports.signup = catchAsync(async(req ,res ,next) => {
    const newUser = await Users.create({
        name: req.body.name,
        email:req.body.email,
        password:req.body.password,
        passwordConfirm:req.body.passwordConfirm
    });
    console.log(process.env.JWT_EXPIRES_IN);

    const token = signToken(newUser._id);



    res.status(201).json({
        status:'created',
        token,
        data:{
            users: newUser
        }
    })
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

    const token = signToken(user._id);

    res.status(201).json({
        status:'success',
        token,
        data:{
            users: newUser
        }
    })
})