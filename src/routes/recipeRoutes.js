const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const { addRecipe,getRecipes  } = require("../controllers/recipeController");

// POST /api/recipes/add → Protected
router.post("/add", authMiddleware, addRecipe);
router.get("/", getRecipes);
module.exports = router;
