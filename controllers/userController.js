import UserModel from "../models/User.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import transporter from "../config/emailConfig.js"

class UserController {
    static userRegistration = async (req, res) => {
        let { name, email, password, password_conf, tc } = req.body

        // Is it a valid email
        function ValidateEmail(mail){
            if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail))
                return (true)
            else
                return (false)
        }

        if(ValidateEmail(email)){ 
            // Is Email already Exists
            const isEmailExists = await UserModel.findOne({ email })
            if (isEmailExists) {
                return res.status(409).send({ "status": "Failed", "message": "Email already exists" })
            } else {
    
                // Is Any Field Empty or Not
                if (name && email && password && password_conf && tc) {
    
                    // Is Password & Confirmation_Password are same
                    if(password === password_conf){
                        try{
                            const salt = await bcrypt.genSalt(10)
                            password = await bcrypt.hash(password, salt)
                            const doc = new UserModel({name, email, password, tc})
                            let userData = await doc.save()
							const token = jwt.sign({UserID: userData._id, email: userData.email}, process.env.JWT_SECRET_KEY, {expiresIn: "1d"})
                            res.status(200).send({ "status": "success", "message": "Registration Successfull", token })
                        }catch(err){
                            return res.status(422).send({ "status": "Failed", "message": "Something went wrong. Try again" })
                        }
                    }else{
                        return res.status(209).send({ "status": "Failed", "message": "Password and Confirm Password should be matched" })
                    }
                } else {
                    return res.status(209).send({ "status": "Failed", "message": "All fields are required" })
                }
            }

        }else{
            return res.status(209).send({ "status": "Failed", "message": "Invalid Email" })
        }
    }
	
	static userLogin = async (req, res) =>{
		let {email, password} = req.body
		if(email && password){
			const isUserExists = await UserModel.findOne({email:email})
			if(isUserExists){
				let isPasswordMatch = await bcrypt.compare(password, isUserExists.password)
				if(isPasswordMatch){
					const token = jwt.sign({userID: isUserExists._id, email: isUserExists.email}, process.env.JWT_SECRET_KEY, {expiresIn: "2d"})
					res.status(200).send({"status": "success", "message": "Login successfull", token, isUserExists})
				}else{
					return res.status(209).send({"status":"Failed", "message":"Email or Password is Invalid"})
				}
			}else{
				return res.status(209).send({"status":"Failed", "message":"Email or Password is Invalid"})
			}
		}else{
			return res.status(209).send({"status":"Failed", "message":"All fields are required"})
		}
	}

    static resetPassword = async(req, res)=>{
        let {userID, password, password_conf} = req.body
        if(password && password_conf){
            if(password === password_conf){
                try {
                    let salt = await bcrypt.genSalt(10)
                    password = await bcrypt.hash(password, salt)
                    await UserModel.findByIdAndUpdate(userID, {password})
                    res.status(200).send({ "status": "success", "message": "Password Changed Successfully" })
                } catch (error) {
                    return res.status(422).send({ "status": "Failed", "message": "Something went wrong. Try again" })
                }
            }else{
			    return res.status(209).send({"status":"Failed", "message":"Password & Confirm password should be matched"})
            }
        }else{
			return res.status(209).send({"status":"Failed", "message":"All fields are required"})
        }
    }

    static forgetPasswordMail = async (req, res)=>{
        let {email}  = req.body
        if(email){
            let user = await UserModel.findOne({email})
            if(user){
                const SECRET_KEY = user._id + process.env.JWT_SECRET_KEY
                const token = jwt.sign({userID: user._id}, SECRET_KEY, {expiresIn: "15m"})
                let recoveLink = `http://localhost:8000/user/recover/${user._id}/${token}`
                let info = await transporter.sendMail({
                    from: process.env.MAIL_SENDER,
                    to: user.email,
                    subject: "Auth Project - Reset Password",
                    html: `<a href=${recoveLink}>Click here</a> to reset your password`
                })
                return res.status(200).send({recoveLink, info})
            }else{
                return res.status(209).send({"status":"Failed", "message":"Email is invalid"})
            }
        }else{
			return res.status(209).send({"status":"Failed", "message":"Email is required"})
        }
    }

    static recoverForgetPassword = async(req, res)=>{
        let {password, password_conf} = req.body
        let {id, token} = req.params;
        if(password && password_conf){
            if(password === password_conf){
                const SECRET_KEY = id + process.env.JWT_SECRET_KEY
                try {
                    jwt.verify(token, SECRET_KEY)
                    let salt = await bcrypt.genSalt(10)
                    password = await bcrypt.hash(password, salt)
                    await UserModel.findByIdAndUpdate(id, {password})
                    res.status(200).send({ "status": "success", "message": "Password recovered successfully" })
                    } catch (error) {
                        return res.status(422).send({ "status": "Failed", "message": "Something went wrong. Maybe this link is broken and expired. Generate a new link" })
                    } 
            }else{
			return res.status(209).send({"status":"Failed", "message":"Password and confirm password should be matched"})
            }
        }else{
			return res.status(209).send({"status":"Failed", "message":"All fields are required"})
        }
    }
	
}

export default UserController