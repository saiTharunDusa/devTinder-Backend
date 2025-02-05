const express = require('express')
const { userAuth } = require("../middlewares/auth");
const {User} = require("../models/User");
const { connectionRequestModel} = require("../models/connectionRequest");
const { default: mongoose } = require('mongoose');
const sendEmail = require("../utils/sendEmail");


const requestRouter = express.Router();

requestRouter.post("/send/request/:status/:userId", userAuth, async (req, res) =>{
    try{
        const fromUser = req.user;
        const fromUserId = req.user._id;
        const toUserId = req.params.userId;
        const status = req.params.status;


        // check whether the given toUserId is of type objectID.
        const isValid = mongoose.Types.ObjectId.isValid(toUserId)
        if(!isValid)
        {
            return res.status(400).send({message : "toUserId is not of type objectID"});
        }
        
        // check whether status is allowed in this API or not.
        const allowedStatus = ["interested", "ignored"]

        if(!allowedStatus.includes(status))
        {
            return res.status(400).json({
                message: "Invalid status type: " + status
            });
        }


        // check whether the toUser exists in our database.
        const toUser = await  User.findById({_id : toUserId});
        if(!toUser)
        {
            return res.status(400).json({
                message: "To User not found!"
            });
        }

        // check whether two people are already connected to each other.
        // And also checking that once the connection request is sent as "from"->"to".
        // Then another connection request like "to"->"from" should not be allowed.
        const alreadyExists = await connectionRequestModel.findOne({
            $or: [
                {fromUserId, toUserId}, 
                {fromUserId : toUserId, toUserId : fromUserId}
            ]
        });
        if(alreadyExists)
        {
            return res.status(400).send({message: "connection request already exists!"});
        }

        

        // save the connection request into database.
        const conRequest = new connectionRequestModel({
            fromUserId : fromUserId,
            toUserId : toUserId,
            status : status
        });

        const data = await conRequest.save();
        const emailRes = await sendEmail.run(
            "A new friend request from " + req.user.firstName,
            req.user.firstName + " is " + status + " in " + toUser.firstName
          );
    
        res.json({
            message: "Connection request status from " + fromUser.firstName + " to " + toUser.firstName + " is" + status,
            data
        })

    }
    catch(err)
    {
        res.status(400).send("Error Message : " + err.message);
    }
});


requestRouter.post("/review/request/:status/:requestId", userAuth, async (req, res) => {
    try{
        // tharun => charan
        // validate the status
        // loggedInUser === charan
        // status between tharun and charan in the database should be interested.
        // tharun should exist in the database.

        // validate the status
        const allowedStatus = ["accepted", "rejected"];
        const status = req.params.status;
        if(!allowedStatus.includes(status))
        {
            return res.status(400).send("Requested Status is not allowed!");
        }

        // loggedInUser === charan
        // status between tharun and charan in the database should be interested.
        // tharun should exist in the database.
        const loggedInUser = req.user;
        // find the user in the connectionRequestModel database so that we could get toUserId.
        const requestId = req.params.requestId;
        const toUserId = loggedInUser._id;
        const connReqObj = await connectionRequestModel.findOne({
            _id : requestId,
            toUserId : loggedInUser._id,
            status : "interested"
        });

        if(!connReqObj)
        {
            return res.status(404).send("Connection Request does not exist in the database!");
        }
    
        // status between charan and tharun should change to accepted or rejected.
        connReqObj.status = status;
        const data = await connReqObj.save();

        const fromUserId = connReqObj.fromUserId;

        res.json({
            message: "Connection Request Status between " + fromUserId + " and " + toUserId + " is " + status,
            data 
        })

    }
    catch(err){
        res.status(400).send("Error Message : " + err.message);
    }
});

module.exports = requestRouter