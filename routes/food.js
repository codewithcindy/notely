const express = require("express");
const router = express.Router({ mergeParams: true });

const Recipe = require("../models/recipeModel");
const User = require("../models/userModel");

const wrapAsync = require("../utilities/wrapAsync");
const { validateRecipe } = require("../middleware.js");
const { isLoggedIn } = require("../middleware");

const multer = require("multer");
const { storage, cloudinary } = require("../cloudinary");
const upload = multer({ storage });

// Show Food home page
router.get("/", isLoggedIn, async (req, res) => {
  const { user } = req.session.passport;
  const currentUser = await User.findOne({ username: user }).populate(
    "recipes"
  );

  // Find all recipe documents
  const recipes = currentUser.recipes;

  res.render(`subPages/food/index`, { recipes });
});

// Food - Create new recipe - show form
router.get("/new", isLoggedIn, (req, res) => {
  res.render(`subPages/food/new`);
});

// Food - Save new recipe in database
router.post(
  "/new",
  isLoggedIn,
  upload.single("image"),
  validateRecipe,
  wrapAsync(async (req, res) => {
    const newRecipe = req.body;
    const { user } = req.session.passport;

    // Find user
    const currentUser = await User.findOne({ username: user });

    // Create new recipe document
    const recipeItem = new Recipe(newRecipe);
    recipeItem.ingredients = newRecipe.ingredients.split(",");

    if (!req.file) {
      req.flash("error", "Please include an image file");
      return res.redirect("/food/new");
    } else {
      recipeItem.image = {
        url: req.file.path,
        filename: req.file.filename,
      };
    }

    // Add recipe to user's array of recipes
    currentUser.recipes.push(recipeItem);

    // Add user as recipe user
    recipeItem.user = currentUser;

    // Save/update user
    await currentUser.save();

    // Save recipe to database
    await recipeItem.save();

    console.log(recipeItem);

    req.flash("success", "new recipe added");
    res.redirect(`/food/${recipeItem._id}`);
  })
);

// Food - show recipe details
router.get("/:id", isLoggedIn, async (req, res) => {
  const { id } = req.params;

  const recipe = await Recipe.findById(id);

  res.render(`subPages/food/show`, { recipe });
});

// Food - Render edit form
router.get("/:id/edit", isLoggedIn, async (req, res) => {
  const { id } = req.params;

  const recipe = await Recipe.findById(id);

  // console.log("old /recipe", recipe);

  res.render(`subPages/food/edit`, { recipe });
});

// Food - Update recipe
router.patch(
  "/:id",
  isLoggedIn,
  upload.single("image"),
  validateRecipe,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const updatedRecipe = req.body;

    const recipe = await Recipe.findByIdAndUpdate(id, updatedRecipe, {
      runValidators: true,
      new: true,
    });

    recipe.ingredients = updatedRecipe.ingredients.split(",");

    if (!req.file) {
      req.flash("error", "Please include an image file");
      return res.redirect(`/food/${id}/edit`);
    } else {
      // Delete old image source from cloudinary
      const oldRecipe = await Recipe.findById(id);
      cloudinary.uploader.destroy(oldRecipe.image.filename);

      // Add new image source to recipe document
      recipe.image = {
        url: req.file.path,
        filename: req.file.filename,
      };
    }

    // Save updated recipe to database
    recipe.save();

    // console.log("updated recipe", recipe);
    // req.flash("success", "recipe successfully updated");

    res.redirect(`/food/${id}`);
  })
);

// Food - Delete recipe
router.delete("/:id", isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const { user } = req.session.passport;

  // Get current user
  const currentUser = await User.findOne({ username: user });

  // Remove recipe from author/user's recipes array
  await User.findByIdAndUpdate(currentUser._id, { $pull: { recipes: id } });

  // Remove recipe from mongo
  const deletedRecipe = await Recipe.findByIdAndDelete(id);

  // Remove recipe image from cloudinary
  cloudinary.uploader.destroy(deletedRecipe.image.filename);

  res.redirect(`/food`);
});

module.exports = router;
