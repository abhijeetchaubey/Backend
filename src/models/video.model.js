import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-paginate-v2"

const VideoSchema = new mongoose.Schema({
    videoFile:{
        type:String, //cloudinary url
        requried:true, 
    },
    thumbnail:{
        type:String,
        requried:true,
    },
    title:{
        type:String,
        requried:true,
    },
    description:{
        type:String,
        requried:true,
    },
    duration:{
        type:Number,
        requried:true,
    },
    views:{
        type:Number,
        default:0
    },
    isPublished:{
        type:Boolean,
        requried:true
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true})

VideoSchema.plugin(mongooseAggregatePaginate)

export const video = mongoose.model("video",VideoSchema)