import { Router } from "express";
import { loginUser, logOutUSer, registerUser } from "../controllers/user.controller.js"; // Fixed typo: 'registerUSer' ➝ 'registerUser'
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

export default router;
