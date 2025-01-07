const mongoose = require('mongoose');


const connectionRequestSchema = new mongoose.Schema({

    fromUserId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    toUserId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    status: {
        type : String,
        required : true,
        enum : {
            values: ["ignored", "interested", "accepted", "rejected"],
            message: `{VALUE} is an incorrect status type. `
        },
    }
}, {timestamps: true})


// for better search functionality by the mongodb which happens internally.
connectionRequestSchema.index({fromUserId: 1, toUserId: 1});

connectionRequestSchema.pre("save", function(next)
{
    const connectionRequest = this;
    // checking self connection.
    if(connectionRequest.fromUserId.equals(connectionRequest.toUserId))
    {
        throw new Error("Cannot send connection request to yourself!");
    }
    next();
});

const connectionRequestModel = new mongoose.model("connectionRequest", connectionRequestSchema);

module.exports = {connectionRequestModel};