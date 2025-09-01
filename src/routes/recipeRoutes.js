const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const {
  addRecipe,
  getRecipes,
  likeRecipe,
  unlikeRecipe,
  getFeed,
  getUserRecipes
} = require("../controllers/recipeController");

// POST /api/recipes/add → Protected
router.post("/add", authMiddleware, addRecipe);

router.get("/", getRecipes);

// Like a recipe
router.post("/:id/like", authMiddleware, likeRecipe);

// Unlike a recipe
router.post("/:id/unlike", authMiddleware, unlikeRecipe);

router.get("/feed", authMiddleware, getFeed);

router.get("/user/:userId", getUserRecipes);
module.exports = router;
