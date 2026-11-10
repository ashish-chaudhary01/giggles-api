import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import messageModel from "../models/message.model.js";
import userModel from "../models/user.model.js";

export async function getChatUsers(req, res) {
  try {
    const loggedInUserId = req.user._id;

    // get all messages of the logged in user
    const messages = await messageModel.find({
      $or: [{ receiverId: loggedInUserId }, { senderId: loggedInUserId }],
    });

    // get all users id you chatted with only once no duplicate
    const chatUsersId = [
      ...new Set(
        messages.map((msg) =>
          msg.senderId.toString() === loggedInUserId.toString()
            ? msg.receiverId.toString()
            : msg.senderId.toString(),
        ),
      ),
    ];

    const chatUsers = await userModel
      .find({
        _id: { $in: chatUsersId },
      })
      .select("-password");

    res.status(200).json(chatUsers);
  } catch (error) {
    console.log("Error in getChatUsers controller", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getMessagesByUserId(req, res) {
  try {
    const { id: receiverId } = req.params; // id of the person whom i am chatting with
    const senderId = req.user._id; // my Id

    // update the all messages status to seen that is sent by the receiver and received by the sender(me)
    await messageModel.updateMany(
      {
        senderId: receiverId,
        receiverId: senderId,
        status: { $ne: "seen" },
      },
      {
        $set: { status: "seen" },
      },
    );

    const messages = await messageModel.find({
      $or: [
        { senderId: senderId, receiverId: receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessageByUserId controller", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function sendMessage(req, res) {
  try {
    const { text = "", image } = req.body;
    const { receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;

    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = await messageModel.create({
      receiverId: receiverId,
      senderId: senderId,
      text,
      image: imageUrl,
      status: "sent",
    });

    const receiverSocketId = getReceiverSocketId(receiverId);
    // if receiver is online
    if (receiverSocketId) {
      // mark the status as delivered
      newMessage.status = "delivered";
      await newMessage.save();

      // send event to receiver for updating his chatList
      const sender = await userModel.findById(senderId).select("-password");
      io.to(receiverSocketId).emit("updateChatList", sender);

      // emit the new message to the receiver in real time
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }
    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
}
