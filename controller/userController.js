const Users = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require('./../utils/apiError');

exports.getAllUsers = catchAsync(async (req , res , next)=>{

    const users = await Users.find();
    res.status(200).json({
        status:'success',
        requestedAt : req.requestTime,
        result:users.length,
        data:{
            users
        }
    })

    
});

function filterObject(obj , ...allowedFields){
    const newObj = {};
    
    Object.keys(obj).forEach(el => {
        if(allowedFields.includes(el)){
            newObj[el] = obj[el];
        }
    });
    return newObj;
}

exports.updateMe = catchAsync( async (req , res , next) =>{
    
    if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword.',
        400
      )
    );
  }
    const filteredObj = filterObject(req.body , 'name' , 'email');
    const user = await Users.findByIdAndUpdate(req.user._id , filteredObj , {new: true , runValidators: true});
    res.status(200).json({
        status:'success',
        data:{
            user
        }
    })
})

exports.getUser = (req , res)=>{
    res.status(500).json({
        status:'error',
        Message:'this url is not yet defined'
    })
};
exports.updateUser = (req , res)=>{
    res.status(500).json({
        status:'error',
        Message:'this url is not yet defined'
    })
};

exports.deleteUser = (req , res)=>{
    res.status(500).json({
        status:'error',
        Message:'this url is not yet defined'
    })
};

exports.createUser = (req , res)=>{
    res.status(500).json({
        status:'error',
        Message:'this url is not yet defined'
    })
};
