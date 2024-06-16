/* IMPORTS */
const express = require('express')
const router = express.Router()
const cors = require('cors')
const {signUpController, logInController } = require('../controllers/authController')



/* ROUTERS & METHODS */

router.post('/Signup', signUpController)
router.post('/LogIn', logInController)


/* EXPORTING ROUTER */
module.exports = router