const express = require('express')
const { userAuth } = require("../middlewares/auth");
const {User} = require('../models/User')
const {validateEditProfileData} = require("../utils/validation")
const bcrypt = require("bcrypt")

const profileRouter = express.Router();



profileRouter.get("/profile/view", userAuth, async(req, res)=>{
    try{
        const user = req.user;
        console.log(user);
        res.json({data: user});

    }catch(err)
    {
        res.status(400).send("Error Message : " + err.message);
    }
});

profileRouter.patch("/profile/edit", userAuth, async(req, res)=>{
    try{
        if(!validateEditProfileData(req))
        {
            throw new Error("Invalid Edit Request!");
        }
        const loggedInUser = req.user;


        // loggedInUser.gender = req.body.gender
        // loggedInUser.age = req.body.age;
        // You should always try to use mapping like below for the above 2 lines code.
        Object.keys(req.body).forEach((key) => loggedInUser[key] = req.body[key]);

        await loggedInUser.save();

        // you can also send a json object as a response.
        res.json({message : "Profile Edit Successfull", data : loggedInUser});
    }catch(err)
    {
        res.status(400).send("Error Message : " + err.message);
    }
})


profileRouter.patch("/profile/forgotpassword", userAuth, async(req, res)=>{
    try{
        const {password} = req.body;
        const loggedInUser = req.user;
        const passwordHash = await bcrypt.hash(password, 10);
        loggedInUser.password = passwordHash;
        await loggedInUser.save();
        res.json({message : "Password has been updated successfully!!!"});
    }catch(err)
    {
        res.status(400).send("Error Message : " + err.message);
    }
});

module.exports = profileRouter