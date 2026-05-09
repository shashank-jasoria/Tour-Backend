const Users = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require('./../utils/apiError');
const factory = require('./handleFactory');
const sharp = require('sharp');
const multer = require('multer');



// const multerStorage = multer.diskStorage({
//   destination: (req , file , cb) =>{
//     cb(null,'public/img/users');
//   },
//   filename:(req , file , cb)=>{
//     const ext = file.mimetype.split('/')[1];
//     cb(null , `${req.user.id}-${Date.now()}.${ext}`)
//   }
// })

const multerStorage = multer.memoryStorage();

const multerFilter = (req , file , cb)=>{
    if(file.mimetype.startsWith('image')){
      cb(null , true);
    }else{
       cb(new AppError('Please Upload an Image File', 400) , false);
    }
  }


const upload = multer({
  storage : multerStorage,
  fileFilter : multerFilter
})


exports.uploadUserPhoto = upload.single('photo')




function filterObject(obj , ...allowedFields){
    const newObj = {};
    
    Object.keys(obj).forEach(el => {
        if(allowedFields.includes(el)){
            newObj[el] = obj[el];
        }
    });
    return newObj;
}

exports.getMe = (req, res, next) => {
  req.params.id = req.user._id;
  next();
};

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});


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
    if (req.file) filteredObj.photo = req.file.filename;

    const user = await Users.findByIdAndUpdate(req.user._id , filteredObj , {new: true , runValidators: true});
    res.status(200).json({
        status:'success',
        data:{
            user
        }
    })
})


exports.deleteMe = catchAsync(async (req, res, next) => {
  await Users.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.getUser = factory.getOne(Users);
exports.getAllUsers = factory.getAll(Users);
exports.updateUser = factory.updateOne(Users);
exports.deleteUser = factory.deleteOne(Users)

exports.createUser = (req , res)=>{
    res.status(500).json({
        status:'error',
        Message:'this url is not yet defined'
    })
};
