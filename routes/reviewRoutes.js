const express = require('express');

const {Protect,restrictTo } = require('./../controller/authController')
const {createReview , getReview , deleteReview , updateReview , getAllReviews ,setTourUserIds} = require('./../controller/reviewController');
const router = express.Router({mergeParams:true});

router.use(Protect);

router.route('/').post(restrictTo('user') ,setTourUserIds ,createReview).get(getAllReviews);
router.route('/:id').patch(restrictTo('user', 'admin') ,updateReview).delete( restrictTo('user', 'admin') ,deleteReview).get(getReview);

module.exports = router;