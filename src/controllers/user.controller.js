import userModel from "../models/user.model";

export async function searchUser(req, res) {
  try {
    const { query } = req.query;
    const userId = req.user._id;
    const searchResults = await userModel
      .find({
        $and: [
          { _id: { $ne: userId } },
          {
            $or: [{ username: query }, { email: query }],
          },
        ],
      })
      .select("fullName profilePic username email")
      .limit(10);

    res.status(200).json(searchResults);
  } catch (error) {
    console.log("Erro in searchUser controller", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
}
