import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query
    if (! videoId) {
        throw new ApiError(400, "Video comment not found ")
    }
 
    const getComments = await Comment.find({
        video: videoId 
    })
    .skip((page - 1) * limit)
    .limit(Number(limit));

    return res
    .status(200)
    .json( new ApiResponse(200, getComments, "got comments successfully")) 

})

const addComment = asyncHandler(async (req, res) => {
    const { content, video, owner } = req.body;

    if (!video || !owner) {
        throw new ApiError(400, "Video or user does not exist");
    }

    if (!content) {
        throw new ApiError(400, "content is missing");
    }

    const comment = await Comment.create({
        content,
        video,
        owner
    });

    if (!comment) {
        throw new ApiError(400, "Failed to create comment");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, comment, "Comment added successfully"));
});


const updateComment = asyncHandler(async (req, res) => {
    const {commentId, content}= req.body

    if (! commentId|| ! content) {
        throw new ApiError(400, "Comment not found")
    }

    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        { 
            $set :{content},
        },
        {new: true}
    )
    if (! updatedComment) {
        throw new ApiError(404, "Failed to update comment")
    }

    return res
    .status(200)
    .json( new ApiResponse(200, updatedComment, "Comment updated successfully")) 
     
})

const deleteComment = asyncHandler(async (req, res) => {
    const {commentId}= req.params

    if (! commentId ) {
        throw new ApiError(400, "Comment not found")
    }
    
    const deletedComment = await Comment.findByIdAndDelete(commentId)

    if (! deletedComment) {
        throw new ApiError(404, "Failed to delete comment")
    }

    return res
    .status(200)
    .json( new ApiResponse(200, deletedComment, "Comment deleted successfully")) 
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
    }