'use strict'
const _ = require('lodash')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

const Order = require('../models/orderModel')
const OrderDetail = require('../models/orderDetailModel')
const catchAsync = require('../utils/catchAsync')

const createQuery = user => {
  const query = { user: user.id, paid: true }

  if (user.role === 'admin') {
    query.user = undefined
    query.paid = undefined
  }

  return query
}

exports.createOrder = catchAsync(async (req, res, next) => {
  const { total } = req.body
  const order = await Order.create({ user: req.user.id, total })

  req.body.order = order // pass order to next step

  next()
})

exports.createCheckoutSession = catchAsync(async (req, res, next) => {
  const { order, cart } = req.body

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    success_url: `${process.env.FRONTEND_URL}/success`,
    cancel_url: `${process.env.FRONTEND_URL}/cancel`,
    customer_email: req.user.email,
    client_reference_id: order._id.toString(),
    metadata: _.mapValues(cart, 'num'),
    line_items: Object.keys(cart).map(id => {
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
      products: products.map(product => product._id)
    })

    res.status(200).json({ received: true })
  }
}

exports.getAllOrders = catchAsync(async (req, res, next) => {
  const query = createQuery(req.user)
  const orders = await Order.find(query)
    .populate('user', 'name')
    .populate({ path: 'products', populate: { path: 'product', select: 'name' } })

  res.status(200).json({ status: 'success', data: { orders } })
})
