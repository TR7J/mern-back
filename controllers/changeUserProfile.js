/* IMPORTS */
const User = require('../models/userModel')
const fs = require('fs')
const path = require('path')
const {v4: uuid} = require("uuid")

const changeUserProfileController = async (req, res) => {
    try {
        if(!req.files.avatar){
            return res.json({error: "Choose an image"})
        }
        // find user from database
        const user = await User.findById(req.username.id)
        // delete profile picture
        if(user.profilepicture){
            fs.unlink(path.join(__dirname, '..', 'uploads', user.profilepicture), (err) => {
                if(err) {
                    console.log(err)
                }
            })
        }
        const {profilepicture} = req.files;
        // checking file size
        if(profilepicture.size){
            return res.json({error: "Maximum Profile Picture Size Should be 500KB"})
        }

        let fileName
        fileName = profilepicture.name
        let splittedFileName = fileName.split('.')
        let newFileName = splittedFileName[0] + uuid() + '.' + splittedFileName[splittedFileName.length - 1]

        // uploading the file 
        profilepicture.mv(path.join(__dirname, '..', 'uploads', newFileName), async (err) => {
            if(err){
                console.log(err)
            }

            const updatedProfilePicture = await User.findByIdAndUpdate(req.user.id, {profilepicture: newFileName}, {new: true})
            if(!updatedProfilePicture){
                return res.json({error: "Profile Picture cannot be changed"})
            }
            res.status(200).json(updatedProfilePicture)
        })
    } catch (error) {
        console.log(error)
    }
}

module.exports = changeUserProfileController
