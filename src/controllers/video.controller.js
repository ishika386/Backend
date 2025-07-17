import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { v2 as cloudinary } from "cloudinary"


const getAllVideos = asyncHandler(async (req, res) => {
    //TODO: get all videos based on query, sort, pagination
    const { page = 1, limit = 10, query, sortBy = "createdAt", sortType = "desc", userId } = req.query;

    const filter = {};

    if (query) {
        filter.$or = [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } }
        ];
    }

    if (userId) {
        filter.owner = userId;
    }

    // Sorting logic
    const sortOptions = {};
    sortOptions[sortBy] = sortType === "asc" ? 1 : -1;

    // Convert pagination values to numbers
    const skip = (Number(page) - 1) * Number(limit);

    const [videos, totalVideos] = await Promise.all([
        Video.find(filter)
            .sort(sortOptions)
            .skip(skip)
            .limit(Number(limit)),
        Video.countDocuments(filter)
    ]);

    return res.status(200).json(
        new ApiResponse(200, {
            videos,
            page: Number(page),
            limit: Number(limit),
            totalVideos,
            totalPages: Math.ceil(totalVideos / limit)
        }, "Videos fetched successfully")
    );
});


const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;

    if (!title || !description) {
        throw new ApiError(400, "Title and description are required");
    }

    if (!req.files || !req.files.videoFile || req.files.videoFile.length === 0) {
        throw new ApiError(400, "Video file is required");
    }

    const videoLocalPath = req.files.videoFile[0].path;
    const thumbnailLocalPath = req.files.thumbnail?.[0]?.path;

    // Upload video
    const uploadedVideo = await cloudinary.uploader.upload(videoLocalPath, {
        resource_type: "video",
        folder: "videos"
    });

    if (!uploadedVideo?.secure_url) {
        throw new ApiError(500, "Video upload failed");
    }

    // Upload thumbnail
    const uploadedThumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if (!uploadedThumbnail?.secure_url) {
        throw new ApiError(500, "Thumbnail upload failed");
    }

    const createdVideo = await Video.create({
        title,
        description,
        videoUrl: uploadedVideo.secure_url,
        cloudinaryId: uploadedVideo.public_id,
        duration: uploadedVideo.duration,
        thumbnail: uploadedThumbnail.secure_url,
        videoFile: uploadedVideo.secure_url,
        owner: req.user._id
    });

    if (!createdVideo) {
        throw new ApiError(500, "Failed to publish video");
    }

    return res.status(200).json(new ApiResponse(200, createdVideo, "Video published successfully"));
});




const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!videoId) {
        throw new ApiError(400,"video id is missing")
    }

    const video = await Video.findById(videoId);
    
    if (!video) {
        throw new ApiError(500,"error while fetching video")
    }

    return res.status(200).json(new ApiResponse(200,video,"video fetched"))

})


const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { title, description } = req.body
    
            if (! videoId) {
                throw new ApiError(400, "Video ID is required")
            }

            if (! title) {
                throw new ApiError(400, "title is required")
            }

            if (! description) {
                throw new ApiError(400, "description is required")
            }

            const thumbnailLocalPath = req.file?.path;

            if(!thumbnailLocalPath){
             throw new ApiError(400,"thumbnail file is missing")
            }

           const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

             if(!thumbnail){
             throw new ApiError(400,"thumbnail upload failed")
            }
        
            const updatedVideo = await Video.findByIdAndUpdate(
                videoId,
                { 
                    $set :{
                        title:title,
                        description: description,
                        thumbnail: thumbnail?.url
                    },
                },
                {new: true}
            )
            if (! updatedVideo) {
                throw new ApiError(404, "Failed to update video")
            }
        
            return res
            .status(200)
            .json( new ApiResponse(200, updatedVideo, "Video updated successfully")) 

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
     if (! videoId) {
        throw new ApiError(400, "video ID not found")
     }
    
     const deletedVideo = await Video.findByIdAndDelete(videoId)
     if (! deletedVideo) {
        throw new ApiError(404, "failed to delete video")
     }

    return res
    .status(200)
    .json( new ApiResponse(200, deletedVideo, "Video deleted successfully"))  
    
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!videoId) {
        throw new ApiError(400, "Video ID is required");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Toggle the published status
    video.isPublished = !video.isPublished;

    await video.save();

    return res.status(200).json(
        new ApiResponse(200, video, `Video is now ${video.isPublished ? 'published' : 'unpublished'}`)
    );
});



export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}