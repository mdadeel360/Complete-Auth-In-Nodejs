import express from "express"
import UserController from "../controllers/userController.js"
import auth from "../middlewares/auth.js"
const router = express.Router()

// Public Routes
router.post("/register", UserController.userRegistration)
router.post("/login", UserController.userLogin)
router.post("/forget-password-mail", UserController.forgetPasswordMail)
router.post("/recover/:id/:token", UserController.recoverForgetPassword)

// Restricted Routes
router.post("/resetpassword", auth, UserController.resetPassword)

export default router