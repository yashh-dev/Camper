const {campSchema,reviewSchema} = require('./schemas')  
const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/campground')

module.exports.isLoggedIn = (req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl;
		req.flash('error','you must be signed in')
		return res.redirect('/login')
    }
    next()

}

module.exports.isAuthor = async(req,res,next)=>{
	const {id} = req.params;
	const camp = await Campground.findById(id);
	if(!camp.author._id.equals(req.user._id)){
		req.flash('error','you do not have persmission!')
		return res.redirect(`/campgrounds/${id}`)
	}
	next();
}

module.exports.validateCampground=(req,res,next)=>{
	const {error }= campSchema.validate(req.body);
	if(error){
		const msg = error.details.map(el => el.message).join(',')
		throw new ExpressError(msg,500)
	}else{
		next()
	}
}

module.exports.validateReview= (req,res,next) =>{
	const {error}= reviewSchema.validate(req.body);
	if(error){
		const msg = error.details.map(el => el.message).join(',')
		throw new ExpressError(msg,500)
	}else{
		next()
	}
}