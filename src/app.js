const express = require("express");
const {connectDB} = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require('cors');

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");


const app = express();

app.use(cors({
    origin: 'https://localhost:5173',
    credentials: true,
}))
app.use(express.json());
app.use(cookieParser());

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);


connectDB().then(()=>{
    console.log("Database connection is successfull");
    app.listen(3000, ()=>{
        console.log("Server is listening!");
    });
    
}).catch(err=>{
    console.log("Database connection failed!");
})







