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
