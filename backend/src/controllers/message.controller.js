import Message from "../models/message.model.js";
import User from '../models/user.model.js'
import cloudinary  from "../lib/cloudinary.js";
import { getRecieverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req,res) => {
   try{
     const loggedInUserId = req.user._id 
     const filteredUsers = await User.find({_id:{$ne:loggedInUserId}}).select("-password")
     res.status(200).json(filteredUsers)
   }
   catch(error){
    console.log('Error in getUsersForSidebar controller', error.message)
    res.status(500).json({message:'Internal server error'})
}
}

export const getMessages = async (req, res) => {
    try{
       const {id:userToChatId} = req.params 
       const myId = req.user._id 

       const messages = await Message.find({
        $or:[
            {senderId:userToChatId, recieverId:myId},
            {senderId:myId, recieverId:userToChatId}
        ]
       })
       res.status(200).json(messages)
    }
    catch(error){
        console.log('Error in getmessages controller', error.message)
        res.status(500).json({message:'Internal server error'})
    }
}

export const sendMessage = async (req,res) => {
    try{

        const {image, text} = req.body 
        const {id:recieverId} = req.params 
        const senderId = req.user._id 

        let imageUrl;
        
        if (image){
            // uplaod base64 image to cloudinary 
            const uploadedResponse = await cloudinary.uploader.upload(image)
            imageUrl = uploadedResponse.secure_url
        }

        const newMessage = new Message({
            senderId,
            recieverId,
            image:imageUrl,
            text
        })

        await newMessage.save()

        const recieverSocketId = getRecieverSocketId(recieverId) 

        if (recieverSocketId){
            io.to(recieverSocketId).emit('newMessage', newMessage)
        }

        res.status(201).json(newMessage)
        

    }
    catch(error){
        console.log('Error in sendMessages controller', error.message)
        res.status(500).json({message:'Internal server error'})
    }
}
