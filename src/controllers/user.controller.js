import { asyncHandeler } from "../utils/asyncHandeler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadONCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
const registerUser = asyncHandeler(async (req, res) => {
  // get user detail from frontend
  const { fullName, email, userName, password } = req.body;
  console.log("email", email);

  // validation -not empty

  if (
    [fullName, email, userName, password].some((field) => !field ||field?.trim() === "")
  ) {
    throw new ApiError(400, "fullname is requried");
  }
  // check if user already exits :username,email

  const existedUser = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }
  // check for images , check for avatar

  // const coverImagePath = req.files?.coverImage[0]?.path;

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
if (!avatarLocalPath) {
  throw new ApiError(400, "Avatar file is required");
}

  // upload them to the cloudinary

const avatar = await uploadONCloudinary(avatarLocalPath);


if (!avatar?.url) {
  throw new ApiError(400, "Failed to upload avatar to Cloudinary");
}

let coverImage = {};
if (req.files?.coverImage?.[0]?.path) {
  coverImage = await uploadONCloudinary(req.files.coverImage[0].path);
}


  if (!avatar) {
    throw new ApiError(400, "Avatar file is requried");
  }
  // create user object - create entry in db
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    userName: userName.toLowerCase(),
  });
  // remove password and refresh token field from response

  const createdUser = await User.findById(user._id).select("-password -refreshToken")

  // check for the user creation

  if (!createdUser) {
    throw new ApiError(500, "Something went Wrong");
  }
  // return res

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered Successfully"));
});

const loginUser = asyncHandeler(async(req,res)=>{
    // req body -> data
    // username or email 
    // find the user 
    // password check
    // access and refresh token
    // send secure cookies 
    // send response 

    const {email,username,password}= req.body
    if((!email && !username) || !password) {
        throw new ApiError(400,"usename or password is requried")
    }

    const user = await User.findOne({
      $or :[{username},{email}]
    })

    if (!user) {
      throw new ApiError(404,"USer not registerd")
    }

    const isPasswordValid =await user.ispasswordCorrect(password)
    console.log("password",password);
    
    if (!isPasswordValid) {
      // console.error(isPasswordValid);
      
      throw new ApiError(401,"Invalid user credential")
    }

    const generateAccessAndRefreshTokens =async(userId)=>{
      try {
        const user=await User.findById(userId)
        const accessToken=user.generateAccessToken()
        const refreshToken=user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave:false})

        return { accessToken,refreshToken }

      } catch (error) {
        
        throw new ApiError(500,"Something went wrong while generating Refresh and access token");
        
      }
    }

    const {accessToken,refreshToken}=await generateAccessAndRefreshTokens(user._id) 

    const loggedInUSer = await User.findById(user._id).select("-password -refreshToken")

    const options ={
      httpOnly:true,
      secure:true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
      new ApiResponse(
        200,{
          user:loggedInUSer,accessToken,refreshToken
        },
        "User logged IN Successfully"
      )
    )
})

const logOutUSer = asyncHandeler(async(req,res)=>{
  await User.findByIdAndUpdate(
    req.user._id,{
      $set:{
        refreshToken:undefined
      }
    },
    {
      new :true
    }
  
  )
    const options ={
      httpOnly:true,
      secure:true
    }
    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User loogged out"))
})

const refreshToken = asyncHandeler(async(req,res)=>{
  const incomingRefreshToken =req.cookies.refreshToken || req.body.refreshToken

  if (!incomingRefreshToken) {
    throw new ApiError(401,"Unauthorized Request")
  }

  try {
    const decodedToken=jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  )

  const user = await User.findById(decodedToken?._id)

  if (!user) {
    throw new ApiError(401,"Invalid Refresh Token")
  }

  if (incomingRefreshToken!==user?.refreshToken) {
    throw new ApiError(401,"refrsh token is expired or used")
  }

  const options={
    httpOnly:true,
    secure:true
  }
  const {accessToken,newrefreshToken}=await generateAccessAndRefreshTokens(user._id)

  return res
  .status(200)
  .cookie("accessToken",accessToken,options)
  .cookie("refreshToken",newrefreshToken,options)
  .json(
    new ApiResponse(200,
      {accessToken,refreshToken:newrefreshToken},
      "Access Toekn refresherd successfully"
    )
  )
  } catch (error) {
    throw new ApiError(401,error?.message||"Invalid refreshToekn")
  }
})

const changeCurrentUSerPassword = asyncHandeler(async(req,res)=>{
  // get info from frontend
  const {oldPassword,newPassword} = req.body

  const user = await User.findById(req.user?._idid)
  const ispasswordCorrect = await user.ispasswordCorrect(oldPassword)

  if (!ispasswordCorrect) {
    throw new ApiError(400,"Invalid old password")
  }
  user.password = newPassword
  await user.save({validateBeforeSave:false})

  return res
  .status(200)
  .json(new ApiResponse (200,{},"Password Changed SUccessfully"))
})

const getCurrrentUSer = asyncHandeler(async(req,res)=>{
  return res
  .status(200)
  .json(200,req.user,"current user fetched successfullly")
})

const updateAccountDetails = asyncHandeler(async(req,res)=>{
  const {fullName, email} = req.body

  if (!fullName || !email) {
    throw new ApiError(400,"fullName or Email is requried")
  }

  const user=await User.findByIdAndUpdate(
    req.user?._id,
    {
        $set:{
          fullName,
          email,

        }
    }, 
    {
      new :true
    }
  ).select("-password")

  return res
  .status(200)
  .json(
    new ApiResponse(200,user,"Account details updated successfully")
  )
})

const updateUSerAvatar = asyncHandeler(async(req,res)=>{

  const avatarLocalPath = req.file?.path

  if (!avatarLocalPath) {
    throw new ApiError(400,"Avatar file is missing")
  }

  const avatar = await uploadONCloudinary(avatarLocalPath)

  if (!avatar.url) {
        throw new ApiError(400,"Error while uploading on avatar")

  }

  const Updatedavatar= await User.findByIdAndUpdate(req.user?._id,
    {
      $set:{
        avatar:avatar.url
      }
    },
    {new:true}
  )
  .select("-password")


  return res 
  .status(200)
  .json(
    new ApiResponse(200,Updatedavatar,"Avatar Updated Successfully")
  )
})

const updateUSerCoverImage = asyncHandeler(async(req,res)=>{

  const coverLocalpath = req.file?.path

  if (!coverLocalpath) {
    throw new ApiError(400,"Avatar file is missing")
  }

  const coverImage = await uploadONCloudinary(coverLocalpath)

  if (!coverImage.url) {
        throw new ApiError(400,"Error while uploading on coverImage")

  }

  const UpdatedCoveravatar= await User.findByIdAndUpdate(req.user?._id,
    {
      $set:{
        coverImage:coverImage.url
      }
    },
    {new:true}
  )
  .select("-password")


  return res 
  .status(200)
  .json(
    new ApiResponse(200,UpdatedCoveravatar,"Avatar Updated Successfully")
  )
})
export { 
  
  registerUser,
  loginUser,
  logOutUSer,
  refreshToken,
  changeCurrentUSerPassword,
  getCurrrentUSer,
  updateAccountDetails,
  updateUSerAvatar,
  updateUSerCoverImage
};
