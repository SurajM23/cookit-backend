const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const {
  addRecipe,
  getRecipes,
  likeRecipe,
  getLikedRecipes,
  getFeed,
  getUserRecipes,
  getRecipeById
} = require("../controllers/recipeController");

// POST /api/recipes/add → Protected
router.post("/add", authMiddleware, addRecipe);

router.get("/", getRecipes);

// Like a recipe
router.post("/:id/like", authMiddleware, likeRecipe);

router.get("/:id/liked", authMiddleware, getLikedRecipes);

router.get("/feed", authMiddleware, getFeed);

router.get("/user/:userId", getUserRecipes);

router.get("/:id", getRecipeById);
module.exports = router;
