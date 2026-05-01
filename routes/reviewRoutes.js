const express = require('express');

const {Protect } = require('./../controller/authController')
const {createReview , getReview , deleteReview , updateReview} = require('./../controller/reviewController');
const router = express.Router({mergeParams:true});



router.route('/').post(Protect , createReview).get(getReview);
router.route('/:id').patch(updateReview).delete(deleteReview);

module.exports = router;