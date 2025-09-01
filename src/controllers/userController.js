const User = require("../models/User");

// POST /api/users/:id/follow
exports.followUser = async (req, res) => {
  try {
    const userIdToFollow = req.params.id;
    const currentUserId = req.user._id;

    if (userIdToFollow === currentUserId.toString())
      return res.status(400).json({ message: "You cannot follow yourself" });

    const userToFollow = await User.findById(userIdToFollow);
    const currentUser = await User.findById(currentUserId);

    if (!userToFollow) return res.status(404).json({ message: "User not found" });

    // Check if already following
    if (currentUser.following.includes(userIdToFollow))
      return res.status(400).json({ message: "Already following this user" });

    // Add follow
    currentUser.following.push(userIdToFollow);
    currentUser.followingCount = currentUser.following.length;

    userToFollow.followers.push(currentUserId);
    userToFollow.followersCount = userToFollow.followers.length;

    await currentUser.save();
    await userToFollow.save();

    res.status(200).json({ message: "User followed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/users/:id/unfollow
exports.unfollowUser = async (req, res) => {
  try {
    const userIdToUnfollow = req.params.id;
    const currentUserId = req.user._id;

    if (userIdToUnfollow === currentUserId.toString())
      return res.status(400).json({ message: "You cannot unfollow yourself" });

    const userToUnfollow = await User.findById(userIdToUnfollow);
    const currentUser = await User.findById(currentUserId);

    if (!userToUnfollow) return res.status(404).json({ message: "User not found" });

    // Remove follow
    currentUser.following = currentUser.following.filter(
      id => id.toString() !== userIdToUnfollow
    );
    currentUser.followingCount = currentUser.following.length;

    userToUnfollow.followers = userToUnfollow.followers.filter(
      id => id.toString() !== currentUserId.toString()
    );
    userToUnfollow.followersCount = userToUnfollow.followers.length;

    await currentUser.save();
    await userToUnfollow.save();

    res.status(200).json({ message: "User unfollowed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.getUserSuggestions = async (req, res) => {
  try {
    const loggedInUserId = req.user.id;

    // Fetch logged-in user to check who they already follow
    const currentUser = await User.findById(loggedInUserId);

    // Exclude self + already followed users
    const excludeIds = [loggedInUserId, ...currentUser.following];

    // Random 10 users excluding above
    const suggestions = await User.aggregate([
      { $match: { _id: { $nin: excludeIds.map(id => id) } } },
      { $sample: { size: 10 } }, // get random 10
      { $project: { username: 1, name: 1, email: 1 } } // only return needed fields
    ]);

    res.json(suggestions);
  } catch (error) {
    console.error("❌ Error fetching user suggestions:", error);
    res.status(500).json({ message: "Server error" });
  }
};


exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    // exclude password from response
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};


