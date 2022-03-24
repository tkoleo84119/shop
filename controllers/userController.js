'use strict'

const User = require('../models/userModel')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')

exports.updateUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  })

  if (!user) return next(new AppError('No User found with this ID', 404))

  res.status(200).json({
    status: 'success',
    message: 'Updated user information successfully',
    data: { user }
  })
})
