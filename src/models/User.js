const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
    {
      firstName: {
        type: String,
        required: true,
        minLength: 4,
        maxLength: 50,
      },
      lastName: {
        type: String,
      },
      emailId: {
        type: String,
        lowercase: true,
        required: true,
        unique: true,
        trim: true,
        validate: {
          validator(value) {
            if(!(validator.isEmail(value) && value.endsWith(".com")))
            {
              throw new Error("Invalid EmailId");
            }
          },
          
        },
      },
      password: {
        type: String,
        required: true,
        validate(value) {
          if (!validator.isStrongPassword(value)) {
            throw new Error("Enter a Strong Password: " + value);
          }
        },
      },
      age: {
        type: Number,
        min: 18,
      },
      gender: {
        type: String,
        enum: {
          values: ["male", "female", "other"],
          message: `{VALUE} is not a valid gender type`,
        },
        validate(value) {
          if (!["male", "female", "others"].includes(value)) {
            throw new Error("Gender data is not valid");
          }
        },
      },
      photoUrl: {
        type: String,
        default: "https://geographyandyou.com/images/user-profile.png",
        validate(value) {
          if (!validator.isURL(value)) {
            throw new Error("Invalid Photo URL: " + value);
          }
        },
      },
      about: {
        type: String,
        default: "This is a default about of the user!",
      },
      skills: {
        type: [String],
        default:[]
      },
    },
    {
      timestamps: true,
    }
  );


userSchema.methods.getJWT = async function(){
	const user = this;

	const token = await jwt.sign({_id : user._id}, "Bunny", {
		expiresIn : "7d",
	});
	
	return token;
}

userSchema.methods.validatePassword = async function(passwordInputByUser)
{
	const user = this;
	const isPasswordValid = await bcrypt.compare(passwordInputByUser, user.password);
	return isPasswordValid;
}
  
const User = mongoose.model("User", userSchema);
module.exports = {User};