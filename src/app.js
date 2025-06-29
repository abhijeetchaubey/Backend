import express from "express"
import  cors from "cors"
import cookieParser from "cookie-parser"
// import userRouter from "../src/routes/user.routes.js"

const app = express()

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({limit:"16kb"})) //to set the limit of the server 
app.use(express.urlencoded({extended:true,limit:"16kb"})) // to handel the white spaces from the url
app.use(express.static("public"))  // to store the images and other thing to the public folder
app.use(cookieParser())  //to access and set the cookies from the server to the browser of the user

//routes import 
import userRouter from "./routes/user.routes.js"

// routes declarations
app.use(express.json()); // To parse JSON body in requests

app.use("/api/v1/users", userRouter);
export {app} 