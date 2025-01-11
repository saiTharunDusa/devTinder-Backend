const express = require('express');
const { userAuth } = require('../middlewares/auth');
const { connectionRequestModel } = require('../models/connectionRequest');
const userRouter = express.Router();
const {User} = require("../models/User")


const USER_SAFE_DATA = "firstName lastName photoUrl age gender about skills"

userRouter.get("/user/requests/received", userAuth, async(req, res)=>{
    try{
        const loggedInUser = req.user;

        const connectionRequest = await connectionRequestModel.find({
            toUserId : loggedInUser._id,
            status : "interested"
        }).populate("fromUserId", USER_SAFE_DATA);

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

        if(connectionRequest.length <= 0)
        {
            res.json({message : "No connections", data : data});
        }
        
        // Now we have populated data in connectionRequest.
        // each object in connectionRequest contains "fromUserId" and "toUserId".
        // for each object check whether fromUserId is charan or toUserId is charan.
        // if fromUserId is charan, then return toUserId. If toUserId is charan, then return fromUserId.
        // because we need connections of charan. But we should not display the Charan data in the connections page.
        const data = connectionRequest.map((row) => {
            if(row.fromUserId && row.toUserId)
            {
                if(row.fromUserId._id.toString() === loggedInUser._id.toString())
                {
                    return row.toUserId;
                }
                return row.fromUserId;
            }
        })

        res.json({message: "Data fetched succesfully!", data : data});

    }
    catch(err)
    {
        res.status(404).send("ERROR: " + err.message);
    }
})

userRouter.get("/user/feed", userAuth, async(req, res)=>{
    try{
        // pagination 
        // .skip() => total no of documents that are to be skipped from the start.
        // .limit() => total no of documents that are to be fetched.

        // /user/feed?page=1&limit=10 => 1-10 users => .skip(0) & .limit(10)
        // /user/feed?page=2&limit=10 => 11-20 users => .skip(10) & .limit(10)
        // /user/feed?page=3&limit=10 => 21-30 users => .skip(20) & .limit(10)

        const page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        limit = (limit > 50) ? 50 : limit
        const skip = (page - 1) * limit;
        


        const loggedInUser = req.user;
        // For suppose, Charan is the logged in user. 
        // charan's feed should not contain the following users.
        // 1. the users who are interested in charan.
        // 2. the users who have rejected charan.
        // 3. the users who are already a connection with charan.

        // all the above users are available in connectionRequestModel database. 
        // we have to find those users that are not in the connectionRequestModel database.

        const connectionReq = await connectionRequestModel.find({
            $or : [
                {fromUserId : loggedInUser._id},
                {toUserId : loggedInUser._id}
            ]
        }).select("fromUserId toUserId");

        const hideUsersFromFeed = new Set();
        connectionReq.forEach((req) => {
            hideUsersFromFeed.add(req.fromUserId.toString());
            hideUsersFromFeed.add(req.toUserId.toString());
        });

        const feedUsers = await User.find({
            $and: [
                {_id : {$nin: Array.from(hideUsersFromFeed)}},
                {_id : {$ne : loggedInUser._id}}
            ]
        }).select(USER_SAFE_DATA);

        // .skip(skip).limit(limit);

        

        res.json({message: "data fetched successfully", data : feedUsers});

    }
    catch(err)
    {
        res.status(404).send("ERROR : " + err.message);
    }
})

module.exports = userRouter;

