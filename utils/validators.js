const {body} = require('express-validator/check')
const User = require('../models/user')

exports.registerValidators = [
  body('email')
    .isEmail().withMessage('Enter correct email')
    .custom(async (value, {req}) => {
      try{
        const user = await User.findOne({email: value})
        if(user) {
          return Promise.reject('User is already exists!')
        }
      } catch(err) {
        console.log(err)
      }
  })
  .normalizeEmail(),
  body('password', 'Password must contain min 6 symbols')
    .isLength({min: 6, max: 56})
    .isAlphanumeric()
    .trim(),
  body('confirm')
    .custom((value, {req}) => {
      if(value !== req.body.password) {
        throw new Error('Password must be same')
      } 
      return true
    })
    .trim(),
  body('name')
    .isLength({min: 3}).withMessage('Name must contain min 3 symbols')
    .trim()
]

exports.courseValidators = [
  body('name')
    .isLength({min:3}).withMessage('Min name length - 3 symbols')
    .trim(),
  body('price').isNumeric().withMessage('Enter correct price'),
  body('url', 'Enter correct image URL').isURL()
]