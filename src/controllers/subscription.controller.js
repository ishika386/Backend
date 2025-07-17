import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId} = req.params;
    const subscriberId = req.user._id;

    if (!channelId || !subscriberId) {
        throw new ApiError(400, "Channel ID or Subscriber ID is missing");
    }

    const existingSubscription = await Subscription.findOne({
        channel: channelId,
        subscriber: subscriberId,
    });

    let action = "";

    if (existingSubscription) {
        await Subscription.findByIdAndDelete(existingSubscription._id);
        action = "unsubscribed";
    } else {
        await Subscription.create({
            channel: channelId,
            subscriber: subscriberId,
        });
        action = "subscribed";
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {}, `Channel ${action} successfully`));
});


const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const channelId = req.user?._id;

    if (!channelId) {
        throw new ApiError(400, "Channel ID is required");
    }

    const subscribers = await Subscription.find({ channel: channelId })
        .populate("subscriber", "fullname username avatar email");

    if (!subscribers || subscribers.length === 0) {
        return res.status(200).json(
            new ApiResponse(200, [], "No subscribers found for this channel")
        );
    }
    return res.status(200).json(
        new ApiResponse(200, subscribers, "Subscribers fetched successfully")
    );
});


// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const  {subscriberId} = req.params;

    if (!subscriberId) {
        throw new ApiError(400, "Subscriber ID is required");
    }

    const subscriptions = await Subscription.find({ subscriber: subscriberId })
        .populate("channel", "fullname username avatar email"); 

    if (!subscriptions || subscriptions.length === 0) {
        return res.status(200).json(
            new ApiResponse(200, [], "No channel subscriptions found for this user")
        );
    }

    return res.status(200).json(
        new ApiResponse(200, subscriptions, "Subscribed channels fetched successfully")
    );
});


export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}