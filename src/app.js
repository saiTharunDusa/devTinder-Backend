const express = require("express");
const { connectDB } = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require('cors');
const http = require('http');

const app = express();


require("dotenv").config();

app.use(
    cors({
      origin: "http://localhost:5173",
      credentials: true,
    })
);

app.use(express.json());
app.use(cookieParser());


const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");
const chatRouter = require("./routes/chat")
const initializeSocket = require("./utils/socket");

const server = http.createServer(app);
initializeSocket(server);

// Routes
app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", chatRouter);

// Database connection and server start
connectDB()
    .then(() => {
        console.log("Database connection is successful");
        server.listen(process.env.PORT, () => {
            console.log("Server is listening on port " + process.env.PORT);
        });
    })
    .catch(err => {
        console.log("Database connection failed:", err);
    });