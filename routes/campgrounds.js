const express = require('express')
const router  = express.Router()
const catchAsync = require('../utils/catchAsync');
const campsController = require('../controllers/campgrounds')
const {isLoggedIn,validateCampground,isAuthor} = require('../middleware');
const multer = require('multer');
const upload = multer({dest : 'uploads/'})

router.route('/')
	.get(catchAsync(campsController.index))
	// .post(isLoggedIn,validateCampground,catchAsync(campsController.createCamp))
	.post(upload.array('image'),(req,res)=>{
		res.send(req.body);
		console.log(req.files);
	})

router.get('/new',isLoggedIn,campsController.renderNewForm)

router.route('/:id')
	.get(catchAsync(campsController.showCampground))
	.put(isLoggedIn,isAuthor,validateCampground,catchAsync(campsController.updateCamp))
	.delete(isLoggedIn, isAuthor,catchAsync( campsController.deleteCamp ))

router.get('/:id/edit',isLoggedIn,isAuthor,catchAsync(campsController.renderEditForm))


module.exports = router