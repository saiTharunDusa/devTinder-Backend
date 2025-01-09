const express = require('express');
const {validateSignUpData} = require("../utils/validation");
const bcrypt = require("bcrypt");
const {User} = require("../models/User");

const authRouter = express.Router();

authRouter.post("/signUp", async (req, res)=>{
    try{
        validateSignUpData(req);
        const {firstName, lastName, emailId, password} = req.body;

        const passwordHash = await bcrypt.hash(password, 10);

        const user = new User({
            firstName,
            lastName,
            emailId,
            password : passwordHash
        });

        await user.save();
        res.json({message : "User added successfully!"})
    } catch(err)
    {
        res.status(404).send(err.message);
    }
});


authRouter.post("/login", async(req, res)=>{
    try{
        const {emailId, password} = req.body;

        const user = await User.findOne({emailId : emailId});
        if(!user)
        {
            throw new Error("Invalid Credentials");
        }
        const isPassword = await user.validatePassword(password);
        if(!isPassword)
        {
            throw new Error("Invalid Credentials");
        }
        else
        {
            const token = await user.getJWT();
            res.cookie("token", token, {
                expires: new Date(Date.now() + 8 * 3600000),
            });
            res.json({message : "Login Successful!!", data:user});
        }
    }
    catch(err)
    {
        res.status(400).send(err.message);
    }
})


authRouter.post("/logout", async (req, res) => {
    res.cookie("token", null, {
        expires: new Date(Date.now())
    }).json({message : "Logout Succesfull!"})
})

module.exports = authRouter;