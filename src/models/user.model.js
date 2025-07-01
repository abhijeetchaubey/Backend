import mongoose from "mongoose"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new mongoose.Schema({
    watchHistory:[
        {
        type:mongoose.Schema.Types.ObjectId,
        ref:"video"
    }
],
    userName:{
        type:String,
        unique:true,
        requried:true,
        lowercase:true,
        trim:true,
        index:true   //to enables search field in db
    },
    email:{
        type:String,
        unique:true,
        requried:true,
        lowecase:true,
        trim:true

    },
    password:{
        type:String,
        requried:[true,'Password is requried'],
    },
    fullName:{
        type:String,
        unique:true,
        requried:true,
        lowecase:true,
        trim:true
    },
    avatar:{
        type:String , //cloudinary url
        requried:true
    },
    coverImage:{
        type:String

    },
    refreshToken:{
        type:String
    }
},{timestamps:true})


userSchema.pre("save", async function(next){
    if (!this.isModified("password")) return next();
    console.log("Hashing password before saving user...");
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

console.log("checking password");
    // console.log("encrypted password",this.password);
    // console.log("normal password",password);
userSchema.methods.ispasswordCorrect = async function 
(password) {

    
    
    return await bcrypt.compare(password,this.password)
}
console.log("checking password");

userSchema.methods.generateAccessToken = function()
{
    return jwt.sign(
        {
            _id:this.id,
            email:this.email,
            userName:this.userName,
            fullName:this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id:this.id,
            email:this.email,
            userName:this.userName,
            fullName:this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User",userSchema)