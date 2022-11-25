const express = require('express')
const router  = express.Router()
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campground')

const {isLoggedIn,validateCampground,isAuthor} = require('../middleware');



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
		campground.author = req.user._id;
		await campground.save()
        req.flash('success','New CampGround Created')
		res.redirect(`/campgrounds/${campground._id}`)
	
}))

router.get('/:id', catchAsync(async (req,res)=>{
	const {id} = req.params;
	const camp = await Campground.findById(id).populate({
		path:'reviews',
		populate:{
			path:'author'
		}}
	).populate('author');
	console.log(camp);
    if(!camp){
        req.flash('error','Cannot find that Campground')
        return res.redirect('/campgrounds')
    }
	res.render('campgrounds/show',{camp})
}))

router.get('/:id/edit',isLoggedIn,isAuthor,catchAsync(async (req,res) => {
	const {id} =req.params;
	const camp = await Campground.findById(id);
    if(!camp){
        req.flash('error','Cannot find that Campground')
        return res.redirect('/campgrounds')
    }
	res.render('campgrounds/edit',{camp})
}))

router.put('/:id',isLoggedIn,isAuthor,validateCampground,catchAsync(async(req,res)=>{
	const {id} =req.params;
	const camp = req.body.campground;
	await Campground.findByIdAndUpdate(id,{...camp})
    req.flash('success','Successfully Updated Campground')
	res.redirect(`/campgrounds/${id}`)
}))

router.delete('/:id',isLoggedIn, isAuthor,catchAsync( async (req,res) => {
	const {id} =req.params;
	await Campground.findByIdAndDelete(id)
    req.flash('success','Successfully deleted the Campground')
	res.redirect('/campgrounds')
}))

module.exports = router