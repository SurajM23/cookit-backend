const Comment = require("../models/Comment");

exports.addComment = async (req, res) => {
  try {
    const { recipeId, text } = req.body;
    const author = req.user.id; // from JWT middleware

    if (!recipeId || !text) {
      return res.status(400).json({ message: "Recipe ID and text are required" });
    }

    const comment = await Comment.create({
      recipe: recipeId,
      author,
      text
    });

    res.status(201).json({ message: "Comment added successfully", comment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getCommentsByRecipe = async (req, res) => {
  try {
    const { recipeId } = req.params;
    const comments = await Comment.find({ recipe: recipeId })
      .populate("author", "username name avatarUrl")
      .sort({ createdAt: 1 }); // oldest first

    res.status(200).json({ comments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
