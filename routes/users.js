const express = require('express')
const passport = require('passport')
const router  = express.Router()
const User = require('../models/user')
const catchAsync  = require('../utils/catchAsync')
router.get('/register',(req,res)=>{
    res.render('auth/register')
})

router.post('/register',catchAsync(async(req,res)=>{
    try{
        const {username,email,password} = req.body;
        const user = new User({email,username})
        const registeredUser =await User.register(user,password)
        req.login(registeredUser,err => {
            if(err){
                return next(err);
            }
            req.flash('success','Welcome to Camper')
            res.redirect('/campgrounds')
        })
        
    }catch(e){
        req.flash('error',e.message)
        res.redirect('/register')
    }
  
}))

router.get('/login',(req,res)=>{
    res.render('auth/login')
})

router.post('/login',passport.authenticate('local',{failureFlash:true,failureRedirect:'/login'}),function (req, res) {
    const {red} = req.query
    res.redirect(red);
  })

router.get('/logout',catchAsync( async(req,res)=>{
    await req.logout(function(err){
        if(err){
            return next(err);
        }
        req.flash('success','Logged Out')
        res.redirect('/campgrounds')
    });
}))

module.exports = router