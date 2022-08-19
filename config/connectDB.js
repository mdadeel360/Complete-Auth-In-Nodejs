import mongoose from "mongoose"


const connectDB = async (URI)=>{
    const DB_OPTIONS = {
        dbName: "registration"
    }
    try{
        mongoose.connect(URI, DB_OPTIONS)
        console.log("DB Connected Successfully!")
    }catch(err){
        console.log("Can't connect to DB! Something went wrong")
    }
}
export default connectDB