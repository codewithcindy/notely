const { recipeSchema } = require("./schemas.js");
const ExpressError = require("./utilities/ExpressError");

// Validate Recipe data
module.exports.validateRecipe = (req, res, next) => {
  // Pass new recipe data to Joi Schema to validate
  const result = recipeSchema.validate(req.body);

  // If validate fails, throw error
  if (result.error) {
    const msg = result.error.details.map((el) => el.message).join(",");
    // Run error handler
    throw new ExpressError(400, msg);
  }
  // If no error, continue with rest of the router handler
  else {
    // Move onto next route handler or non-error middleware
    next();
  }
};

// Check if a user is logged in/authenticated
module.exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    req.flash("error", "please log in");
    res.redirect("/login");
  }
};
