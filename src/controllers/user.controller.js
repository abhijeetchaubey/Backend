import { asyncHandeler } from "../utils/asyncHandeler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadONCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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
export { 
  
  registerUser,
  loginUser,
  logOutUSer
};
