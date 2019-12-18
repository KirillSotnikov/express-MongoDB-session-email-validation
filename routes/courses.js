const {Router} = require('express')
const Course = require('../models/course')
const auth = require('../middleware/auth')
const {validationResult} = require('express-validator/check')
const router = Router()
const {courseValidators} = require('../utils/validators')

function isOwner(course, req) {
  return course.userId.toString() === req.user._id.toString()
}

router.get('/', async (req, res) => {
  try{
    const courses = await Course.find()
      .populate('userId', 'email name')
      
    res.render('courses', {
      pageTitle: 'Courses page', 
      isCourses: true, 
      userId: req.user ? req.user._id.toString() : null,
      courses
    })
  } catch(err) {
    console.log(err)
  }
})

router.get('/:id/edit', auth, async (req, res) => {
  if (!req.query.allow) {
    return res.redirect('/')
  }

  try{
    const course = await Course.findById(req.params.id)

    if(!isOwner(course, req)) {
      return res.redirect('/courses')
    }

    res.render('course-edit', {
      pageTitle: `Edit Course '${course.name}'`,
      course
    })
  } catch(err) {
    console.log(err)
  }
})

router.post('/edit', auth, courseValidators, async (req, res) => {
  try{
    let {name, price, url, id} = req.body

    const errors = validationResult(req)

    if(!errors.isEmpty()) {
      return res.status(422).redirect(`/courses/${id}/edit?allow=true`)
    }

    delete req.body.id
    const course = await Course.findById(id)
    if(!isOwner(course, req)) {
      return res.redirect('/courses')
    }

    Object.assign(course, req.body)
    // await Course.findByIdAndUpdate(id, req.body)
    await course.save()
    res.redirect('/courses')
  } catch(err) {
    console.log(err)
  }
})

router.post('/remove', auth, async (req, res) => {
  try{
    await Course.deleteOne({ 
      _id: req.body.id,
      userId: req.user._id
    })
    res.redirect('/courses')
  } catch(err) {
    console.log(err)
  }
})

router.get('/:id', async (req, res) => {
  try{
    const course = await Course.findById(req.params.id)
    res.render('course', {layout: 'empty', pageTitle: `Course ${course.name}`, course})
  } catch(err) {
    console.log(err)
  }
})

module.exports = router