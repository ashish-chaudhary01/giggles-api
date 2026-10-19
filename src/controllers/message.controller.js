export async function sendMessage(req, res) {
  try {
    const { message } = req.body;
    const { receiverId } = req.params;
    const senderId = req.user._id;
  } catch (error) {}
}
