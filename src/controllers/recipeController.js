const Recipe = require("../models/Recipe");

// POST /api/recipes/add
exports.addRecipe = async (req, res) => {
  try {
    const { title, description, ingredients, steps, cookTime, imageUrl } = req.body;

    if (!title || !ingredients || !steps || !cookTime)
      return res.status(400).json({ message: "Missing required fields" });

    const newRecipe = new Recipe({
      title,
      description,
      ingredients,
      steps,
      cookTime,
      imageUrl,
      author: req.user._id, // comes from JWT middleware
    });

    const savedRecipe = await newRecipe.save();

    res.status(201).json({ message: "Recipe added successfully", recipe: savedRecipe });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// GET /api/recipes?page=1
exports.getRecipes = async (req, res) => {
  try {
    // Page number from query, default 1
    const page = parseInt(req.query.page) || 1;
    const limit = 10; // fixed 10 recipes per page
    const skip = (page - 1) * limit;

    // Count total recipes
    const totalRecipes = await Recipe.countDocuments();

    // Fetch recipes
    const recipes = await Recipe.find()
      .sort({ createdAt: -1 })           // newest first
      .skip(skip)
      .limit(limit)
      .populate("author", "username name avatarUrl"); // populate author info

    // Send paginated response
    res.status(200).json({
      page,
      totalPages: Math.ceil(totalRecipes / limit),
      totalRecipes,
      recipes
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


