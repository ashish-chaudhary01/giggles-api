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
    const { id: receiverId } = req.params;
    const senderId = req.user._id;
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
    const { text = "", image = "" } = req.body;
    const { receiverId } = req.params;
    const senderId = req.user._id;

    // TODO: if image then upload it to imageKit or cloudinary
    const newMessage = await messageModel.create({
      receiverId: receiverId,
      senderId: senderId,
      text,
      image,
    });

    // todo : message in real time if user is online

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
}
