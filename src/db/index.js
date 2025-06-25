import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";



const connectDB = async () => {
    try {
        const connection =await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log("\n MongoDB Connected !! DB HOST:" );
        
    } catch (error) {
        console.log("Error in connecting with DB",error);
        process.exit(1)
    }
}

export default connectDB