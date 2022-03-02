'use strict'

const express = require('express')
const router = express.Router()

const authController = require('../../controllers/authController')

router.post('/signup', authController.signUp)
router.post('/signin', authController.signIn)
router.post('/forgetPassword', authController.forgetPassword)
router.patch('/resetPassword/:token', authController.resetPassword)

router.use(authController.authStatus)
router.patch('/updatePassword', authController.updatePassword)

module.exports = router
