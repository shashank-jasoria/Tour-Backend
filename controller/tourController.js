const fs = require('fs');
const Tour = require('./../models/tourModel');
const { match } = require('assert');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/apiError')
const factory = require('./handleFactory');
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