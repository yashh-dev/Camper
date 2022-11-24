const express = require('express')
const router  = express.Router({mergeParams:true})
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground')
const Review = require('../models/review')
const {reviewSchema} = require('../schemas')



const validateReview= (req,res,next) =>{
	const {error}= reviewSchema.validate(req.body);
	if(error){
		const msg = error.details.map(el => el.message).join(',')
		throw new ExpressError(msg,500)
	}else{
		next()
	}
}

 router.post('/',validateReview,catchAsync(async(req,res)=>{

	const camp = await Campground.findById(req.params.id);
	const review = new Review(req.body.review);
	camp.reviews.push(review);
	await review.save();
	await camp.save();
    req.flash('success','your review submitted')
	res.redirect(`/campgrounds/${camp._id}`)
}))

router.delete('/:reviewId',catchAsync(async(req,res)=>{
	const {id , reviewId} = req.params;
	await Campground.findByIdAndUpdate(id,{$pull:{reviews:reviewId}})
	await Review.findByIdAndDelete(reviewId);
    req.flash('success','Successfully deleted review')
	res.redirect(`/campgrounds/${id}`)
}))


module.exports = router