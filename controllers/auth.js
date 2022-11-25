const User = require('../models/user')

module.exports.renderRegisterForm = (req,res)=>{
    res.render('auth/register')
}

module.exports.registerUser = async(req,res)=>{
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
  
}


module.exports.renderLoginForm = (req,res)=>{
    res.render('auth/login')
}

module.exports.loginUser = function (req, res) {
    const {red} = req.query
    res.redirect(red);
  }

module.exports.logoutUser = async(req,res)=>{
    await req.logout(function(err){
        if(err){
            return next(err);
        }
        req.flash('success','Logged Out')
        res.redirect('/campgrounds')
    });
}