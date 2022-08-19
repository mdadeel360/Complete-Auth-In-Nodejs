import jwt from "jsonwebtoken"
import UserModel from "../models/User.js"
const auth = async (req, res, next)=>{
    // console.log(object)
    const {authorization} = req.headers
    if(authorization.startsWith("Bearer")){
        let token = authorization.split(" ")[1]
        try {
            let {userID} = jwt.verify(token, process.env.JWT_SECRET_KEY)
            const userData = await UserModel.exists({_id: userID})
            console.log(userData)
            if(userData){
                req.body.userID = userData._id
                next()
            }else{
                res.status(400).send({"status":"Failed", "message": "Invalid Token"})
            }
        } catch (error) {
            res.status(400).send({"status":"Failed", "message": "Invalid Token"})
        }
    }else{
        res.status(400).send({"status":"Failed", "message": "Invalid Token"})
    }
}
export default auth

