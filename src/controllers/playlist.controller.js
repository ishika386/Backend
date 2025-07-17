import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description, videoId , userId} = req.body;

    if (!videoId) {
        throw new ApiError(400, "Video ID is required");
    }

    if (!name || !description) {
        throw new ApiError(400, "Name and Description are required");
    }

    const createPL = await Playlist.create({
        name,
        description,
        videos: [videoId],
        owner: req.user._id || req.body.userId
    });

    if (!createPL) {
        throw new ApiError(500, "Failed to create playlist");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, createPL, "Playlist created successfully"));
});


const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  const playlists = await Playlist.find({ owner: userId });

  return res
    .status(200)
    .json(new ApiResponse(200, playlists, "Playlists fetched successfully"));
});


const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    
    if (! playlistId) {
        throw new ApiError(400, "Playlist ID is missing")
    }

    const getPLbyID = await Playlist.findById(playlistId)

     if (! getPLbyID) {
        throw new ApiError(404, " playlist is missing")
    }

    return res
    .status(200)
    .json( new ApiResponse(200, getPLbyID, "Playlist by ID fetched successfully")) 
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if (! playlistId || ! videoId) {
        throw new ApiError(400, "Playlist id and video id are missing")
    }

    const addVideo = await Playlist.findByIdAndUpdate(
        playlistId,

        {
            $addToSet :{
                videos: videoId
            }
        },
        {new: true}
    )

    if (! addVideo) {
         throw new ApiError(404, "failed to add video to playlist ")
    }

    return res
    .status(200)
    .json( new ApiResponse(200, addVideo, "added video successfully")) 
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    

    if (! playlistId || ! videoId) {
        throw new ApiError(400, "Playlist id and video id are missing")
    }

    const removeVideo = await Playlist.findByIdAndUpdate(
        playlistId,

        {
            $pull :{
                videos: videoId
            }
        },
        {new: true}
    )

    if (! removeVideo) {
         throw new ApiError(404, "failed to remove video from playlist ")
    }

    return res
    .status(200)
    .json( new ApiResponse(200, addVideo, "removed video successfully")) 
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
   
    if (! playlistId) {
        throw new ApiError(400, "playlist id is missing")
    }

    const deletedPL = await Playlist.findByIdAndDelete(playlistId)

    if (! deletedPL) {
        throw new ApiError(404, "failed to delete playlist")
    }

     return res
    .status(200)
    .json( new ApiResponse(200, deletedPL, "deleted playlist successfully")) 

})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
   
    if (! playlistId) {
        throw new ApiError(400, "Playlist id is missing")
    }
    if (! name || ! description){
        throw new ApiError(400, "name and description are missing")
    }

    const updatePL = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set :{
                name,
                description
            }
        },
        {new: true}
    )

    if (! updatePL) {
         throw new ApiError(404, "failed to update playlist ")
    }

    return res
    .status(200)
    .json( new ApiResponse(200, updatePL, "updated playlist successfully")) 
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}