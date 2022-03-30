const express = require('express')
const router = express.Router()

const authController = require('../../controllers/authController')
const orderController = require('../../controllers/orderController')

router.use(authController.authStatus)
router
  .route('/')
  .post(orderController.createOrder, orderController.createCheckoutSession)
  .get(orderController.getAllOrders)

router
  .route('/:id')
  .get(orderController.getOrder)
  .delete(authController.authRole('admin'), orderController.deleteOrder)

module.exports = router
