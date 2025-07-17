import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    
    const { userId} = req.params
    const {content} = req.body 

    if (( ! userId)) {
        throw new ApiError(400, "user does not exist")
    }
    if (! content) {
        throw new ApiError(404, "please write something")
    }

    const createdTweet = await Tweet.create({
        content,
        owner : userId,
    })

    if (! createdTweet) {
        throw new ApiError(400, "failed to create tweet")
    }

     return res
    .status(200)
    .json( new ApiResponse(200, createdTweet, "Tweet created successfully"))  
})


const getUserTweets = asyncHandler(async (req, res) => {
   
    const {userId} = req.params
    if (! userId) {
        throw new ApiError(400, "User ID not found")
    }

    const getTweets = await Tweet.find({owner : userId})

    if (! getTweets || getTweets.length === 0) {
        throw new ApiError(404, "Tweet not found")
    }

     return res
        .status(200)
        .json( new ApiResponse(200, getTweets, "Tweets found successfully")) 

})

const updateTweet = asyncHandler(async (req, res) => {
    
    const {tweetId, content}= req.body
    
        if (! tweetId || ! content) {
            throw new ApiError(400, "Tweet ID and new content are required")
        }
    
        const updatedTweet = await Tweet.findByIdAndUpdate(
            tweetId,
            { 
                $set :{content},
            },
            {new: true}
        )
        if (! updatedTweet) {
            throw new ApiError(404, "Failed to update tweet")
        }
    
        return res
        .status(200)
        .json( new ApiResponse(200, updatedTweet, "Tweet updated successfully")) 
         
})

const deleteTweet = asyncHandler(async (req, res) => {
    
     const {tweetId}= req.params
    
        if (! tweetId ) {
            throw new ApiError(400, "Tweet not found")
        }
        
        const deletedTweet = await Tweet.findByIdAndDelete(tweetId)
    
        if (! deletedTweet) {
            throw new ApiError(404, "Failed to delete tweet")
        }
    
        return res
        .status(200)
        .json( new ApiResponse(200, deletedTweet, "Tweet deleted successfully")) 
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}