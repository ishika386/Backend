import mongoose from "mongoose"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { _id: userId } = req.user;

    if (!videoId || !userId) {
        throw new ApiError(400, "Video ID or User ID is missing");
    }

    const likedVideo = await Like.findOne({ video: videoId, likedBy: userId });
    let action = "";

    if (likedVideo) {
        await Like.findByIdAndDelete(likedVideo._id);
        action = "unliked";
    } else {
        await Like.create({ video: videoId, likedBy: userId });
        action = "liked";
    }

    return res.status(200).json(new ApiResponse(200, {}, `Video ${action} successfully`));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { _id: userId } = req.user;

    if (!commentId || !userId) {
        throw new ApiError(400, "Comment ID or User ID is missing");
    }

    const likedComment = await Like.findOne({ comment: commentId, likedBy: userId });
    let action = "";

    if (likedComment) {
        await Like.findByIdAndDelete(likedComment._id);
        action = "unliked";
    } else {
        await Like.create({ comment: commentId, likedBy: userId });
        action = "liked";
    }

    return res.status(200).json(new ApiResponse(200, {}, `Comment ${action} successfully`));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const { _id: userId } = req.user;

    if (!tweetId || !userId) {
        throw new ApiError(400, "Tweet ID or User ID is missing");
    }

    const likedTweet = await Like.findOne({ tweet: tweetId, likedBy: userId });
    let action = "";

    if (likedTweet) {
        await Like.findByIdAndDelete(likedTweet._id);
        action = "unliked";
    } else {
        await Like.create({ tweet: tweetId, likedBy: userId });
        action = "liked";
    }

    return res.status(200).json(new ApiResponse(200, {}, `Tweet ${action} successfully`));
});

const getLikedVideos = asyncHandler(async (req, res) => {
    const { _id: userId } = req.user;

    if (!userId) {
        throw new ApiError(400, "User ID is missing");
    }

    const likedVideos = await Like.find({ likedBy: userId, video: { $exists: true } }).populate("video");

    if (!likedVideos || likedVideos.length === 0) {
        throw new ApiError(404, "No liked videos found");
    }

    return res.status(200).json(new ApiResponse(200, likedVideos, "Liked Videos fetched successfully"));
});

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
};
