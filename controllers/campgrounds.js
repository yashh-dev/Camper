const { cloudinary } = require('../cloudinary');
const Campground = require('../models/campground')

module.exports.index = async (req,res) => {
	const camps = await Campground.find({});
	res.render('campgrounds/index',{camps})
}

module.exports.renderNewForm = (req,res)=>{
	res.render('campgrounds/new');
}

module.exports.createCamp=async(req,res,next)=>{
	const campground = new Campground(req.body.campground);	
	campground.image = req.files.map(f => ({url : f.path, filename : f.filename}))
    campground.author = req.user._id;
    await campground.save()
    req.flash('success','New CampGround Created')
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.showCampground = async (req,res)=>{
	const {id} = req.params;
	const camp = await Campground.findById(id).populate({
		path:'reviews',
		populate:{
			path:'author'
		}}
	).populate('author');
    if(!camp){
        req.flash('error','Cannot find that Campground')
        return res.redirect('/campgrounds')
    }
	res.render('campgrounds/show',{camp})
}


module.exports.renderEditForm = async (req,res) => {
	const {id} =req.params;
	const camp = await Campground.findById(id);
    if(!camp){
        req.flash('error','Cannot find that Campground')
        return res.redirect('/campgrounds')
    }
	res.render('campgrounds/edit',{camp})
}

module.exports.updateCamp = async(req,res)=>{
	const {id} =req.params;
	const camp = req.body.campground;
	const campground = await Campground.findByIdAndUpdate(id,{...camp})
	const imgs = req.files.map(f => ({url : f.path, filename : f.filename}))
	campground.image.push(...imgs);
	campground.save()
	if(req.body.deleteImages){
		for(let filename of req.body.deleteImages){
			await cloudinary.uploader.destroy(filename);
		}
		await campground.updateOne({$pull:{image:{filename:{$in:req.body.deleteImages}}}})
	}
    req.flash('success','Successfully Updated Campground')
	res.redirect(`/campgrounds/${id}`)
}

module.exports.deleteCamp = async (req,res) => {
	const {id} =req.params;
	await Campground.findByIdAndDelete(id)
    req.flash('success','Successfully deleted the Campground')
	res.redirect('/campgrounds')
}	