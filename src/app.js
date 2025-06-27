import express from "express"
import  cors from "cors"
import cookieParser from "cookie-parser"
import { asyncHandeler } from "./utils/asyncHandeler.js"
const app = express()

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({limit:"16kb"})) //to set the limit of the server 
app.use(express.urlencoded({extended:true,limit:"16kb"})) // to handel the white spaces from the url
app.use(express.static("public"))  // to store the images and other thing to the public folder
app.use(cookieParser())  //to access and set the cookies from the server to the browser of the user

app.get("/", asyncHandeler(async (req, res) => {
    // const user = await db.getUser()
    res.send("<h1>Abhijeet</h1>")
}))
export {app} 