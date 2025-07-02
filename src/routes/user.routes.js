import { Router } from "express";
import { loginUser, logOutUSer, refreshToken, registerUser,changeCurrentUSerPassword,getCurrrentUSer,updateAccountDetails, updateUSerAvatar, getUserChannelProfile, getWatchHistory } from "../controllers/user.controller.js"; // Fixed typo: 'registerUSer' ➝ 'registerUser'
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/register").post(
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 }
    ]),
    registerUser
);

router.route("/login").post(loginUser )

// secured routes
router.route("/logout").post(verifyJWT,logOutUSer) //verifyJWT is middleware
router.route("/refresh-token").post(refreshToken)

router.route("/changed-password").post(verifyJWT,changeCurrentUSerPassword)
router.route("/getCurrrentUSer").post(verifyJWT,getCurrrentUSer)
router.route("/updateAccountDetails").patch(updateAccountDetails)
router.route("/avatar").patch(verifyJWT,upload.single("avatar"),updateUSerAvatar)
router.route("/cover-image").patch(verifyJWT,upload.single("coverImage"),updateUSerCoverImage)
router.route("/c/:username").get(verifyJWT,getUserChannelProfile)
router.route("/history").get(verifyJWT,getWatchHistory)
export default router;
