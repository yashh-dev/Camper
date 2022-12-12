if(process.env.NODE_ENV !== "production"){
	require('dotenv').config()
}

const express = require('express');
const session = require('express-session')
const flash = require('connect-flash')
const path = require('path')
const mongoose = require('mongoose')
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate')
const campRouter = require('./routes/campgrounds')
const reviewRouter = require('./routes/reviews')
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user')
const authRouter = require('./routes/users')
const ExpressError = require('./utils/ExpressError')
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet')
const db_url = process.env.DB_URL || "mongodb://localhost:27017/camper";
const secret = process.env.SESSION_SECRET || 'secret';
const MongoStore = require('connect-mongo');

mongoose.connect(db_url).catch(e=>{
	console.log("DB ERROR");
	console.log(e);
})

const db = mongoose.connection;

const app = express();

const port = 3000;

app.use(express.urlencoded({extended:true}))
app.use(methodOverride('_method'))
app.set('view engine','ejs')
app.set('views',path.join(__dirname,'views'))
app.engine('ejs',ejsMate)
app.use(express.static(path.join(__dirname,'public')))
app.use(mongoSanitize());
app.use(helmet())
const scriptSrcUrls = [
	"https://stackpath.bootstrapcdn.com/bootstrap/5.0.0-alpha1/js/bootstrap.min.js",
	"https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js",
    "https://stackpath.bootstrapcdn.com",
    "https://kit.fontawesome.com",
    "https://cdnjs.cloudflare.com",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
	"https://cdn.jsdelivr.net/npm/bootstrap@5.2.2/dist/css/bootstrap.min.css",
    "https://kit-free.fontawesome.com",
    "https://stackpath.bootstrapcdn.com",
    "https://fonts.googleapis.com",
    "https://use.fontawesome.com",
];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'"],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            childSrc: ["blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
				"https://res.cloudinary.com/dkxao025l/image/",
                // "https://res.cloudinary.com/dkxao025l/",
                "https://images.unsplash.com",
            ],
            fontSrc: ["'self'"],
        },
    })
);


const sessionConfig = {
	store : MongoStore.create({
		mongoUrl : db_url,
		secret : secret,
		touchAfter : 24*60*60
	}),
	name : 'repmac',
	secret : secret,
	resave : false,
	saveUninitialized : false,
	cookie : {
		httpOnly : true,
		// secure : true,
		expires : Date.now() + (1000 * 60 * 60 * 24 * 7),
		maxAge : 1000 * 60 * 60 * 24 * 7
	}
}

app.use(session(sessionConfig));

app.use(passport.initialize());
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())
app.use(flash())

app.use((req,res,next)=>{
	res.locals.returnTo = req.session.returnTo;
	res.locals.success = req.flash('success');
	res.locals.error = req.flash('error');
	res.locals.user = req.user;
	next()
})

app.use('/',authRouter)
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
