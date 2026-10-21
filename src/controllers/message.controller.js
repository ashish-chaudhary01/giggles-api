export async function sendMessage(req, res) {
  try {
    const { message } = req.body;
    const { receiverId } = req.params;
    const senderId = req.user._id;
  } catch (error) {}
}

export async function getMessagesByUserId(req,res){
  try {
    const {id:receiverId} = req.params;
    const senderId = req.user._id;
  } catch (error) {
    
  }
}