/* IMPORTS */
const User = require('../models/userModel')

/* CONTROLLER FOR GETTING ALL USERS */
const getAllUsersController = async (req, res) => {
    try {
        const allUsers = await User.find().select('-password')
        res.json(allUsers)
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    getAllUsersController
}