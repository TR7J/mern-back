/* IMPORTS */
const User = require('../models/userModel')
const {hashPassword, comparePassword} = require('../bcrypt/bcrypt')
const jwt = require('jsonwebtoken')

/* ADMIN FUNCTION */
async function confirmAdmin (email) {
    // Assume there's a list of creator emails
    const adminEmails = ['timjediel99@gmail.com', 'jkibura@gmail.com']; 
    return adminEmails.includes(email);
}


/* SIGN UP USER CONTROLLER */
const signUpController = async (req, res) =>{
    try {
        const {username, email, password} = req.body

        //Confirm if username was entered by the user
        if(!username){
            return res.json({error: "username is required"})
        }
        //Confirm if password was good
        if(!password || password.length < 6){
            return res.json({error: "Password is required. Make sure it is at least 6 characters long."})
        }
        //Confirm if email exists or not
        const emailExist = await User.findOne({email})
        if (emailExist) {
            return res.json({
                error: "Email already exists"
            })
        }
        //Hashing the password
        const hashedPassword = await hashPassword(password)

        // calling our confirm admin function and using email as the parameter
        const isAdmin = await confirmAdmin(email)
         
        //Creating our user in our database

        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            role: isAdmin ? 'admin' : 'user'
        })

        return res.json(user)
    } catch (error) {
        console.log(error)
    }
}


/* LOG IN USER CONTROLLER */
const logInController = async (req, res) => {
    try {
        const {username, password} = req.body;

        //Confirm is the user exists using the username
        const user = await User.findOne({username})
        if(!user){
            return res.json({
                error: "This user does not exist"
            })
        }

        //Confirm if the password are the same as the one in our database
        const passwordMatch = await comparePassword(password, user.password)
        if(passwordMatch){
           jwt.sign({username: user.username, id: user._id, email: user.email}, process.env.JWT_SECRET, {}, (err, token) => {
            if(err) throw(err);
            res.cookie('token', token).json(user)
           })
        }
        if(!passwordMatch){
            res.json({error: "Passwords do not match "})
        }
    } catch (error) {
        console.log(error)
    }
}


/* EXPORTING CONTROLLERS*/
module.exports = {
    signUpController,
    logInController,
}