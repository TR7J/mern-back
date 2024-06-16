/* IMPORTS */
const User = require('../models/userModel')

/* CONTROLLER FOR GETTING ONE USER(PROFILE) */
const getUserController = async (req, res) => {
    try {
        const {id} = req.params;
        const user = await User.findById(id).select('-password')
        if (user) {
            res.status(200).json(user)
        } else {
            res.json({error: "User not found"})
        }
    } catch (error) {
        console.log(error)
    }
}

module.exports = getUserController
