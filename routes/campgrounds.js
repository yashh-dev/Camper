const express = require('express')
const router  = express.Router()
const catchAsync = require('../utils/catchAsync');
const campsController = require('../controllers/campgrounds')
const {isLoggedIn,validateCampground,isAuthor} = require('../middleware');
const multer = require('multer');
const {storage} = require('../cloudinary')
const upload = multer({storage})

router.route('/')
	.get(catchAsync(campsController.index))
	.post(isLoggedIn,upload.array('image'),validateCampground	,catchAsync(campsController.createCamp))

router.get('/new',isLoggedIn,campsController.renderNewForm)

router.route('/:id')
	.get(catchAsync(campsController.showCampground))
	.put(isLoggedIn,isAuthor,validateCampground,catchAsync(campsController.updateCamp))
	.delete(isLoggedIn, isAuthor,catchAsync( campsController.deleteCamp ))

router.get('/:id/edit',isLoggedIn,isAuthor,catchAsync(campsController.renderEditForm))


module.exports = router