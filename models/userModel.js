/* IMPORTS */
const mongoose = require('mongoose')
const {Schema} = mongoose

/* CREATING A NEW SCHEMA */
const userSchema = new Schema({
    username: String,
    email: {
        type: String,
        unique: true
    },
    password: String,
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    }
})

/* DEFINING WHERE WE WANT THIS USER MODEL IN OUR DATABASE */
const UserModel = mongoose.model('User', userSchema)

/* EXPORTING THE USER MODEL */
module.exports = UserModel