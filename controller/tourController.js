const fs = require('fs');
const Tour = require('./../models/tourModel');
const { match } = require('assert');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/apiError')
const factory = require('./handleFactory');
const sharp = require('sharp');
const multer = require('multer');
// const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));

// exports.checkId = (req , res , next , next , val)=>{
//     console.log(`Tour id is: ${val}`);
//     const id = Number(val);
//     const tour = tours.find(el => el.id === id);
    
//     if(!tour){
//         return res.status(404).json({
//             status:"error",
//             Message:'Invalid ID'
//         })
//     }
//     next();
// }

// exports.checkBody = (req,res,next,next)=>{
//     const { name, price, property } = req.body;

//     const missingFields = [];

//     if (!name) missingFields.push('name');
//     if (!price) missingFields.push('price');
//     if (!property) missingFields.push('property');

//     if (missingFields.length > 0) {
//         return res.status(400).json({
//         status: "fail",
//         message: `${missingFields.join(', ')} is required`
//         });
//     }
//     next();
// }

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


exports.uploadUserPhoto = upload.fields([
    {name:'imageCover' , maxCount : 1} ,
    {name : 'images' , maxCount : 3}
])

exports.resizeTourImages =catchAsync( async (req , file , next) =>{
  if (!req.files.imageCover || !req.files.images) return next();

  // 1) Cover image
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  // 2) Images
  req.body.images = [];

  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);

      req.body.images.push(filename);
    })
  );

  next();
});


exports.aliasTopTours = (req, res ,next) =>{
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
}


exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, { path: 'reviews' });
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

// exports.createTour = (req,res,next)=>{
//     const newId = tours[tours.length-1].id +1;
//     const newTour = Object.assign({id:newId},req.body)
//     tours.push(newTour);
//     fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json` , JSON.stringify(tours) , error=>{
//         res.status(201).json({
//             status:'created',
//             length : tours.length,
//             // data:{
//             //     tours
//             // }
//         })
//     })

// };

exports.tourStats = catchAsync (async (req,res,next) =>{
    
    const stats = await Tour.aggregate([
        {
            $match:{ratingsAverage : {$gte : 4.5}}
        },
        {
            $group:{
                _id: {$toUpper : '$difficulty'},
                numTours:{$sum: 1},
                numRatings:{$sum : '$ratingsQuantity'},
                avgRating:{$avg : '$ratingsAverage'},
                avgPrice:{$avg : '$price'},
                minPrice:{$max : '$price'},
                maxPrice:{$min : '$price'}
            }
        },{
            $sort:{avgPrice :1}
        }
    ]);

    res.status(200).json({
        status:'success',
        data:{
            stats
        }
    })
    
    
})

exports.getToursWithin = catchAsync( async (req , res , next)=>{
    const {distance , latlng , unit} = req.params;
    const [lat, lng] = latlng.split(',');
    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
    if (!lat || !lng) {
        next(
        new AppError(
            'Please provide latitutr and longitude in the format lat,lng.',
            400
        )
        );
    }

    const tours = await Tour.find({startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }})
    
    
    res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours
    }
  });
})

exports.getDistances = async (req , res , next)=>{
    const {latlng , unit} = req.params;
    const [lat, lng] = latlng.split(',');
    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
    if (!lat || !lng) {
        next(
        new AppError(
            'Please provide latitutr and longitude in the format lat,lng.',
            400
        )
        );
    }

    const distances = await Tour.aggregate([
        {
            $geoNear : {
                near : {
                    type:'Point',
                    coordinates:[lng * 1 , lat * 1]
                },
                distanceField : 'distance',
                distanceMultiplier : multiplier
            }
        },
        {
            $project:{
                distance : 1,
                name:1
            }
        }
    ])

    res.status(200).json({
        status:'success',
        data:{
            distances
        }
    })

}


exports.getMonthlyPlan = catchAsync (async (req,res,next) =>{
    

    const year = req.params.year * 1;
    const plans = await Tour.aggregate([
        {$unwind : '$startDates'},
        {$match : {
            startDates : {$gte : new Date(`${year}-01-01`),$lte : new Date(`${year}-12-31`)}
        }},
        {$group : {
            _id: {$month: '$startDates'},
            numTourStarts : {$sum : 1},
            tours:{$push :'$name'}
        }},
        {$addFields :{month : '$_id'}},
        {$project : {_id: 0}},
        {$sort : {numTourStarts : -1}},
        {$limit : 6}
    ])

    res.status(200).json({
        status:'success',
        data:{
            plans
        }
    })
   
})