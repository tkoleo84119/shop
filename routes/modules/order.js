const express = require('express')
const router = express.Router()

const authController = require('../../controllers/authController')
const orderController = require('../../controllers/orderController')

router.use(authController.authStatus)
router.route('/').post(orderController.createOrder, orderController.createCheckoutSession)

module.exports = router
