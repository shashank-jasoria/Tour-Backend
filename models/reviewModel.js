const mongoose = require('mongoose');
const Tours = require('./tourModel');
const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty!']
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'tours',
      required: [true, 'Review must belong to a tour.']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'users',
      required: [true, 'Review must belong to a user']
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/ , function(next){
  //  this.populate({
  //   path: 'tour',
  //   select: 'name'
  // }).populate({
  //   path: 'user',
  //   select: 'name photo'
  // });

  next();
})

reviewSchema.statics.calAverageRating = async function (tourId){
  const stats = await this.aggregate([
    {
      $match:{tour:tourId}
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ])
  if (stats.length > 0) {

    await Tours.findByIdAndUpdate(tourId , {
      ratingsAverage : stats[0].avgRating,
      ratingsQuantity: stats[0].nRating,
    })
  }else{
    await Tours.findByIdAndUpdate(tourId , {
      ratingsAverage : 4.5,
      ratingsQuantity: 0,
    })
  }

  console.log(stats);
}


reviewSchema.post('save',function(){
   this.constructor.calAverageRating(this.tour);
})

reviewSchema.pre(/^findOneAnd/, async function(next) {
  this.r = await this.findOne();
  // console.log(this.r);
  next();
});

reviewSchema.post(/^findOneAnd/, async function() {
  // await this.findOne(); does NOT work here, query has already executed
  await this.r.constructor.calAverageRating(this.r.tour);
});

const review = mongoose.model('reviews',reviewSchema);

module.exports = review;