'use strict'

const User = require('../models/userModel')

exports.signup = async (req, res) => {
  const { name, email, password, passwordConfirm, role } = req.body
  const newUser = await User.create({ name, email, password, passwordConfirm, role })

  res.status(201).json({ status: 'success' })
}
