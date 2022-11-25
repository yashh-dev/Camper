const express = require('express')
const router  = express.Router({mergeParams:true})
const catchAsync = require('../utils/catchAsync');
const reviewCtrl = require('../controllers/reviews')

const {validateReview, isLoggedIn, isReviewAuthor} =require('../middleware')


router.post('/',isLoggedIn,validateReview,catchAsync(reviewCtrl.createReview))

router.delete('/:reviewId',isLoggedIn,isReviewAuthor,catchAsync(reviewCtrl.deleteReview))


module.exports = router