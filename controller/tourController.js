const fs = require('fs');
const Tour = require('./../models/tourModel');
const { match } = require('assert');
const APIFeatures = require('./../utils/apiFeatures');

// const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));

// exports.checkId = (req , res , next , val)=>{
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

// exports.checkBody = (req,res,next)=>{
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


exports.getAllTours = async (req , res)=>{
    try {
        // const queryObj = {...req.query};
        // const excludedFields = ['page' , 'sort' , 'limit' , 'fields']
        // excludedFields.forEach((el) => delete queryObj[el]);

        // let queryStr = JSON.stringify(queryObj);
        // queryStr = queryStr.replace(/\b(lt|lte|gt|gte)\b/g, match => `$${match}`);
        
        // let query = Tour.find(JSON.parse(queryStr));
        // const query = Tour.find().where('duration').equals(5).where('difficulty').equals('easy');

        // if(req.query.sort){
        //     const sortBy = req.query.sort.split(',').join(' ');
        //     query = query.sort(sortBy)
        // }else{
        //     query = query.sort('-createdAt')
        // }

        // if(req.query.fields){
        //     const fields = req.query.fields.split(',').join(' ');
        //     query = query.select(fields);
        // }else{
        //     query = query.select('-__v');
        // }

        
        // const page = req.query.page * 1 || 1;
        // const limit = req.query.limit * 1 || 100;
        // const skip = (page - 1) * limit;

        // query = query.skip(skip).limit(limit);

        // if(req.query.page ){
        //     const numTours = await Tour.countDocuments();
        //     if(skip >= numTours){
        //         throw new Error('this page does not exist')
        //     }
        // }

        const features = new APIFeatures(Tour.find(),req.query).filter().sort().limitFields().paginate();
        const tours = await features.query;
        res.status(200).json({
            status:'success',
            requestedAt : req.requestTime,
            result:tours.length,
            data:{
                tours
            }
        })
    } catch (error) {
        res.status(404).json({
            status:'fail',
            Message:error
        })
    }
    
};
exports.getTour =  async (req,res)=>{
    try {

        const tour = await Tour.findById(req.params.id);
        // Tour.findOne({ _id: req.params.id })

        res.status(200).json({
            status:"success",
            data:{
                tour
            }
        })
    } catch (error) {
        res.status(404).json({
            status:'fail',
            Message:error
        })
    }
    
    
};
exports.updateTour = async (req,res)=>{

    try {
        const id = Number(req.params.id);
        const tour = await Tour.findByIdAndUpdate(req.params.id , req.body , {
            runValidators:true,
            new:true
        })
        res.status(200).json({
            status:"success",
            data:{
                tour
            }
        })
    } catch (error) {
        res.status(404).json({
            status:'fail',
            Message:error
        })
    }
    
    
    
    // fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json` , JSON.stringify(tour) , error=>{
    //     res.status(200).json({
    //         status:"success",
    //         // data:{
    //         //     tour
    //         // }
    //     })
    // })
        
    
};

exports.deleteTour = async (req,res)=>{
    try {
        const tour = await Tour.findByIdAndDelete(req.params.id)
        console.log(tour);
        res.status(204).json({
            status:"success",
            data:null
        })
    } catch (error) {
        res.status(404).json({
            status:'fail',
            Message:error
        })
    }
    
   
    
    

};

// exports.deleteTour = (req,res)=>{
//     const id = Number(req.params.id);
//     const tour = tours.filter((val) => {
//         if(val.id != id){
//             return val;
//         }
//     });
    
//     fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json` , JSON.stringify(tour) , error=>{
//         res.status(204).json({
//             status:"success",
//             data:null
//         })
//     })
    
    

// };

exports.createTour = async (req,res)=>{
    console.log(req.body);

    try {
        const newTour = await Tour.create(req.body);
        res.status(201).json({
            status:'created',
            length : newTour.length,
            data:{
                tour:newTour
            }
        })
    } catch (err) {
        res.status(400).json({
            status:'error',
            message:err
        })
    }
    


};


// exports.createTour = (req,res)=>{
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

exports.tourStats = async (req,res) =>{
    try {
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
    } catch (error) {
        res.status(400).json({
            status:'fail',
            Message : error
        })
    }
    
}

exports.getMonthlyPlan = async (req,res) =>{
    try {

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
    } catch (error) {
        res.status(400).json({
            status:'fail',
            Message : error
        })
    }
}