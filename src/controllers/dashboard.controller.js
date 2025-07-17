import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    const  channelId  = req.user?._id;

    if (!channelId) {
        throw new ApiError(400, "Channel ID is required");
    }

    const totalSubscribers = await Subscription.countDocuments({ channel: channelId });

    // Get videos uploaded by the channel
    const videos = await Video.find({ owner: channelId });

    // Get total number of videos
    const totalVideos = videos.length;

    // Calculate total views
    const totalViews = videos.reduce((acc, video) => acc + (video.views || 0), 0);

    // Get total likes on all videos
    const videoIds = videos.map((video) => video._id);
    const totalLikes = await Like.countDocuments({ video: { $in: videoIds } });

    const stats = {
        totalSubscribers,
        totalVideos,
        totalViews,
        totalLikes,
    };

    return res
        .status(200)
        .json(new ApiResponse(200, stats, "Channel stats fetched successfully"));
});


const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const  channelId = req.user?._id;

    if (!channelId) {
        throw new ApiError(400, "Channel ID is missing");
    }

    const videos = await Video.find({ owner: channelId });

    if (!videos || videos.length === 0) {
        throw new ApiError(404, "No videos found for this channel");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, videos, "Videos fetched successfully"));
});


export {
    getChannelStats, 
    getChannelVideos
    }