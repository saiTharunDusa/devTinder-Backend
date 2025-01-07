const express = require('express');
const { userAuth } = require('../middlewares/auth');
const { connectionRequestModel } = require('../models/connectionRequest');
const userRouter = express.Router();


const USER_SAFE_DATA = "firstName lastName photoUrl age gender about skills"

userRouter.get("/user/requests/received", userAuth, async(req, res)=>{
    try{
        const loggedInUser = req.user;

        const connectionRequest = await connectionRequestModel.find({
            toUserId : loggedInUser._id,
            status : "interested"
        }).populate("fromUserId", USER_SAFE_DATA);
        // populate("fromUserId", ["firstName", "lastName"]);

        res.json({
            message: "Data fetched successfully!",
            data: connectionRequest
        })
    }
    catch(err)
    {
        res.status(404).send("ERROR: " + err.message);
    }
})


userRouter.get("/user/connections", userAuth, async(req, res)=>{
    try{
        const loggedInUser = req.user;

        // let us say that charan is logged in. Charan has connections with Tharun, Kiran and Anil.
        // His connections either come from toUserId or fromUserId. 
        // so that's why populating from "fromUserId" and "toUserId".
        const connectionRequest = await connectionRequestModel.find({
            $or:[
                {toUserId : loggedInUser, status : "accepted"},
                {fromUserId : loggedInUser, status: "accepted"}
            ]
        }).populate("fromUserId", USER_SAFE_DATA).populate("toUserId", USER_SAFE_DATA);

        console.log(connectionRequest);

        
        // Now we have populated data in connectionRequest.
        // each object in connectionRequest contains "fromUserId" and "toUserId".
        // for each object check whether fromUserId is charan or toUserId is charan.
        // if fromUserId is charan, then return toUserId. If toUserId is charan, then return fromUserId.
        // because we need connections of charan. But we should not display the Charan data in the connections page.
        const data = connectionRequest.map((row) => {
            if(row.fromUserId._id.toString() === loggedInUser._id.toString())
            {
                return row.toUserId;
            }
            return row.fromUserId;
        })

        res.json({message: "Data fetched succesfully!", data : data});

    }
    catch(err)
    {
        res.status(404).send("ERROR: " + err.message);
    }
})

module.exports = userRouter;

