const express = require('express');
const session = require('express-session')
const flash = require('connect-flash')
const path = require('path')
const mongoose = require('mongoose')
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate')
const campRouter = require('./routes/campgrounds')
const reviewRouter = require('./routes/reviews')
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
app.use(express.static(path.join(__dirname,'public')))

const sessionConfig = {
	secret : 'crash',
	resave : false,
	saveUninitialized : true,
	cookie : {
		httpOnly : true,
		expires : Date.now() + (1000 * 60 * 60 * 24 * 7),
		maxAge : 1000 * 60 * 60 * 24 * 7
	}
}

app.use(session(sessionConfig));
app.use(flash())
app.use((req,res,next)=>{
	res.locals.success = req.flash('success');
	res.locals.error = req.flash('error')
	next()
})
app.use('/campgrounds',campRouter)
app.use('/campgrounds/:id/reviews',reviewRouter)




app.get('/',(req,res)=>{
	res.render('home')
}
)



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
