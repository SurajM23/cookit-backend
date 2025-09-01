const express = require("express");
const router = express.Router();
const { addComment, getCommentsByRecipe } = require("../controllers/commentController");
const authMiddleware = require("../middlewares/authMiddleware");

// Add a comment
router.post("/addcomments", authMiddleware, addComment);

// Get comments for a recipe
router.get("/:recipeId", getCommentsByRecipe);

module.exports = router;
