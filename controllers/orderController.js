'use strict'
const _ = require('lodash')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

const Order = require('../models/orderModel')
const OrderDetail = require('../models/orderDetailModel')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')

const createQuery = user => {
  const query = { user: user.id, paid: true }

  if (user.role === 'admin') {
    return _.omit(query, ['user', 'paid'])
  }

  return query
}

exports.createOrder = catchAsync(async (req, res, next) => {
  const { subTotal, cart } = req.body
  const order = await Order.create({
    user: req.user.id,
    products: Object.keys(cart),
    subTotal,
    deliveryFee: subTotal > 1500 ? 0 : 200
  })

  req.body.order = order // pass order to next step

  next()
})

exports.createCheckoutSession = catchAsync(async (req, res, next) => {
  const { order, cart } = req.body
  const productData = Object.keys(cart).map(id => {
    return {
      quantity: cart[id].num,
      price_data: {
        currency: 'twd',
        unit_amount: cart[id].price * 100,
        product_data: {
          name: cart[id].name,
          description: cart[id].description,
          images: [cart[id].image]
        }
      }
    }
  })

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    success_url: `${process.env.FRONTEND_URL}/success/${order._id.toString()}`,
    cancel_url: `${process.env.FRONTEND_URL}/cancel/${order._id.toString()}`,
    customer_email: req.user.email,
    client_reference_id: order._id.toString(),
    metadata: _.mapValues(cart, 'num'),
    line_items: productData.concat([
      {
        quantity: 1,
        price_data: {
          currency: 'twd',
          unit_amount: order.deliveryFee * 100,
          product_data: {
            name: 'Delivery Fee'
          }
        }
      }
    ])
  })

  res.status(200).json({ status: 'success', session })
})

exports.webhook = async (req, res) => {
  const sig = req.headers['stripe-signature']
  let event

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.WEB_HOOK_SECRET)
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`)
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const products = await Promise.all(
      Object.keys(session.metadata).map(id =>
        OrderDetail.create({
          order: session.client_reference_id,
          product: id,
          quantity: session.metadata[id]
        })
      )
    )

    await Order.findByIdAndUpdate(session.client_reference_id, {
      paid: true,
      orderDetails: products.map(product => product._id)
    })

    res.status(200).json({ received: true })
  }
}

exports.getAllOrders = catchAsync(async (req, res, next) => {
  const query = createQuery(req.user)
  const orders = await Order.find(query).populate('user', 'name').populate('products', 'name')

  res.status(200).json({ status: 'success', data: { orders } })
})

exports.getOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate('user')
    .populate('products', 'name')
    .populate({ path: 'orderDetails', populate: { path: 'product' } })

  if (!order) return next(new AppError('No order found with this ID', 404))

  res.status(200).json({ status: 'success', data: { order } })
})

exports.deleteOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findByIdAndDelete(req.params.id)

  if (!order) return next(new AppError('No order found with this ID', 404))

  res.status(204).json({ status: 'success', message: 'Delete order successfully', data: null })
})
