const mongoose = require('mongoose');


const connectDB = async () => {

   await mongoose.connect("mongodb+srv://dusasaitharun:ucUKSTG2MHCNU8Vu@nodejs.wyf0k.mongodb.net/DevTinder");
}

module.exports = {connectDB};
