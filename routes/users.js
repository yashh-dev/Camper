const express = require('express')
const passport = require('passport')
const router  = express.Router()
const User = require('../models/user')
const catchAsync  = require('../utils/catchAsync')
const authCtrl = require('../controllers/auth')

router.route('/register')
    .get(authCtrl.renderRegisterForm)
    .post(catchAsync(authCtrl.registerUser))

router.route('/login')
    .get(authCtrl.renderLoginForm)
    .post(
        passport.authenticate(
        'local',
        {
            failureFlash:true,
            failureRedirect:'/login'
        }
        ),
        authCtrl.loginUser
        )

router.get('/logout',catchAsync( authCtrl.logoutUser ))

module.exports = router