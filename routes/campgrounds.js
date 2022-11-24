const express = require('express')
const router  = express.Router()
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground')
const {campSchema} = require('../schemas')  
const {isLoggedIn} = require('../middleware');
const validateCampground=(req,res,next)=>{
	const {error }= campSchema.validate(req.body);
	if(error){
		const msg = error.details.map(el => el.message).join(',')
		throw new ExpressError(msg,500)
	}else{
		next()
	}
}

router.get('/',catchAsync( async (req,res) => {
	const camps = await Campground.find({});
	res.render('campgrounds/index',{camps})
}
)
)
router.get('/new',isLoggedIn,(req,res)=>{
	res.render('campgrounds/new');
})

router.post('/',isLoggedIn,validateCampground,catchAsync(async(req,res,next)=>{
		const campground = new Campground(req.body.campground);
		await campground.save()
        req.flash('success','New CampGround Created')
		res.redirect(`/campgrounds/${campground._id}`)
	
}))

router.get('/:id', catchAsync(async (req,res)=>{
	const {id} = req.params;
	const camp = await Campground.findById(id).populate('reviews');
    if(!camp){
        req.flash('error','Cannot find that Campground')
        return res.redirect('/campgrounds')
    }
	res.render('campgrounds/show',{camp})
}))

router.get('/:id/edit',isLoggedIn,catchAsync(async (req,res) => {
	const {id} =req.params;
	const camp = await Campground.findById(id);
    if(!camp){
        req.flash('error','Cannot find that Campground')
        return res.redirect('/campgrounds')
    }
	res.render('campgrounds/edit',{camp})
}))

router.put('/:id',isLoggedIn,validateCampground,catchAsync(async(req,res)=>{
	const {id} =req.params;
	const camp = req.body.campground;
	await Campground.findByIdAndUpdate(id,{...camp})
    req.flash('success','Successfully Updated Campground')
	res.redirect(`/campgrounds/${id}`)
}))

router.delete('/:id',isLoggedIn, catchAsync( async (req,res) => {
	const {id} =req.params;
	await Campground.findByIdAndDelete(id)
    req.flash('success','Successfully deleted the Campground')
	res.redirect('/campgrounds')
}))

module.exports = router