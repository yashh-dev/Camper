const express = require('express');
const path = require('path')
const mongoose = require('mongoose')
const Campground = require('./models/campground')
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate')
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const {campSchema} = require('./schemas')
mongoose.connect('mongodb://localhost:27017/camper')

const db = mongoose.connection;
db.on("error",err=> console.error.bind(console,"Connection Error"))
db.once("open",()=>console.log("Database Connected"))
const app = express();

const port = 3000;

app.use(express.urlencoded({extended:true}))
app.use(methodOverride('_method'))
app.set('view engine','ejs')
app.set('views',path.join(__dirname,'views'))
app.engine('ejs',ejsMate)

const validateCampground=(req,res,next)=>{
	const {error }= campSchema.validate(req.body);
	if(error){
		const msg = error.details.map(el => el.message).join(',')
		throw new ExpressError(msg,500)
	}else{
		next()
	}
}

app.get('/',(req,res)=>{
	res.render('home')
}
)

app.get('/campgrounds',catchAsync( async (req,res) => {
	const camps = await Campground.find({});
	res.render('campgrounds/index',{camps})
}
)
)
app.get('/campgrounds/new',(req,res)=>{
	res.render('campgrounds/new')
})

app.post('/campgrounds',validateCampground,catchAsync(async(req,res,next)=>{
		
		const campground = new Campground(req.body.campground);
		await campground.save()
		res.redirect(`/campgrounds/${campground._id}`)
	
}))

app.get('/campgrounds/:id', catchAsync(async (req,res)=>{
	const {id} = req.params;
	const camp = await Campground.findById(id);
	res.render('campgrounds/show',{camp})
}))

app.get('/campgrounds/:id/edit',catchAsync(async (req,res) => {
	const {id} =req.params;
	const camp = await Campground.findById(id);
	res.render('campgrounds/edit',{camp})
}))

app.put('/campgrounds/:id',validateCampground,catchAsync(async(req,res)=>{
	const {id} =req.params;
	const camp = req.body.campground;
	await Campground.findByIdAndUpdate(id,{...camp})
	res.redirect(`/campgrounds/${id}`)
}))

app.delete('/campgrounds/:id', catchAsync( async (req,res) => {
	const {id} =req.params;
	await Campground.findByIdAndDelete(id)
	res.redirect('/campgrounds')
}))

app.get('*',(req,res,next)=>{
	next(new ExpressError('Page not found',404))
})

app.use((err,req,res,next)=>{
	const { message ='we are having a internal problem' ,status = 500} = err;
	
	if(!err.message){
		err.message = "Something went wrong"
	}
	res.status(status).render('error',{err})
})
app.listen(port,()=>{
	console.log(`Serving on ${port}....`);
})
