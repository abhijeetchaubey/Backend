import { asyncHandeler } from "../utils/asyncHandeler.js";
import { ApiError } from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadONCloudinary} from "../utils/cloudnary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
const registerUSer = asyncHandeler(async (req,res)=>{
        // get user detail from frontend
        const {fullName,email,userName,password}=req.body
        console.log("email",email);
        
        // validation -not empty 

        if (

            [fullName,email,userName,password].some((field)=>
                field?.trim()===""
            )
        ) {
            throw new ApiError(400,"fullname is requried")
        }
                 // check if user already exits :username,email

        const existedUser=User.findOne({
            $or:[{ userName },{ email }]
        })

        if (existedUser) {
            throw new ApiError(409,"User with email or username already exists")
        }
                // check for images , check for avatar

            const avatarLocalPath = req.files?.avatar[0]?.path
            const coverImagePath = req.files?.coverImage[0]?.path;

            if (!avatarLocalPath) {
                throw new ApiError(400,"Avatar file is requried ")
            }
        // upload them to the cloudinary

            const avatar =await  uploadONCloudinary(avatarLocalPath)
            const coverImage = await uploadONCloudinary(coverImagePath)

            if(!avatar){
                throw new ApiError(400,"Avatar fiel is requried")
            }
         // create user object - create entry in db 
        const user =await User.create({
            fullName,
            avatar:avatar.url,
            coverImage:coverImage?.url || "",
            email,
            password,
            userName:userName.toLowecase()
        })
        // remove password and refresh token field from response

        const createdUSer = await User.findById(User._id).select(
            "-password, -refreshToken"
        )
                // check for the user creation

        if (!createdUSer) {
            throw new ApiError(500,"Something went Wrong")
        }
        // return res

        return res.status(201).json(
            new ApiResponse(200,createdUSer,"User registered Successfully")
        )


})  


export {registerUSer} 