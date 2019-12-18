const {Router} = require('express')
const router = Router()
const {validationResult} = require('express-validator/check')
const auth = require('../middleware/auth')
const {courseValidators} = require('../utils/validators')

const Course = require('../models/course')

router.get('/', auth, (req, res) => {
  res.render('add', {pageTitle: 'Add courses page', isAdd: true})
})

router.post('/', auth, courseValidators, async (req, res) => {
  try{
    let {name, price, url} = req.body

    const errors = validationResult(req)

    if(!errors.isEmpty()) {
      return res.status(422).render('add', {
        pageTitle: 'Add courses page', 
        isAdd: true,
        error: errors.array()[0].msg,
        data: {
          name, 
          price, 
          url,
        }
      })
    }

    const course = await new Course({
      name, 
      price, 
      url,
      userId: req.user
    })
  
    await course.save()
  
    res.redirect('/courses')
  } catch (err) {
    throw new Error(err)
  }
})

module.exports = router