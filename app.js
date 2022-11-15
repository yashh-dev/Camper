const express = require('express');
const path = require('path')
const mongoose = require('mongoose')
const Campground = require('./models/campground')
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate')

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

app.get('/',(req,res)=>{
	res.render('home')
}
)

app.get('/campgrounds', async (req,res) => {
	const camps = await Campground.find({});
	res.render('campgrounds/index',{camps})
}
)

app.get('/campgrounds/new',(req,res)=>{
	res.render('campgrounds/new')
})

app.post('/campgrounds',async(req,res)=>{
	const campground = new Campground(req.body.campground);
	await campground.save()
	res.redirect(`/campgrounds/${campground._id}`)
})

app.get('/campgrounds/:id', async (req,res)=>{
	const {id} = req.params;
	const camp = await Campground.findById(id);
	res.render('campgrounds/show',{camp})
})

app.get('/campgrounds/:id/edit',async (req,res) => {
	const {id} =req.params;
	const camp = await Campground.findById(id);
	res.render('campgrounds/edit',{camp})
})

app.put('/campgrounds/:id',async(req,res)=>{
	const {id} =req.params;
	const camp = req.body.campground;
	await Campground.findByIdAndUpdate(id,{...camp})
	res.redirect(`/campgrounds/${id}`)
})

app.delete('/campgrounds/:id', async (req,res) => {
	const {id} =req.params;
	await Campground.findByIdAndDelete(id)
	res.redirect('/campgrounds')
})

app.listen(port,()=>{
	console.log(`Serving on ${port}....`);
})