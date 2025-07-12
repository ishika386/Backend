import mongoose, {Schema} from "mongoose";

const tweetSchema = new Schema({
    content:{
        tyoe:String,
        required:true
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref : "User"
    },
},{timestamps:true})

export const Tweet = mongoose.model("Tweet", tweetSchema) 