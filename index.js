if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const User = require("./models/userModel");
const ExpressError = require("./utilities/ExpressError");
const foodRoutes = require("./routes/food");
const homeRoutes = require("./routes/home");
const usersRoutes = require("./routes/users");
const todoRoutes = require("./routes/todo");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const ejsMate = require("ejs-mate");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/notelyDB";
const secret = process.env.SECRET;

// Mongoose
mongoose
  .connect(dbUrl)
  .then(() => {
    console.log("Database connected");
  })
  .catch((err) => {
    console.log("Database connection failed");
  });

// EJS-Mate
app.engine("ejs", ejsMate);

// EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Static Assets
app.use(express.static(path.join(__dirname, "public")));

// Parse Form Data
app.use(express.urlencoded({ extended: true }));

// Method Override
app.use(methodOverride("_method"));

// Session
const store = MongoStore.create({
  mongoUrl: dbUrl,
  secret,
  touchAfter: 24 * 60 * 60,
});

store.on("error", function (e) {
  console.log("SESSION STORE ERROR", e);
});

const sessionOptions = {
  store,
  name: "session",
  secret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
    httpOnly: true,
  },
};
app.use(session(sessionOptions));

// Passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Flash
app.use(flash());

// Res.locals for Flash
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.greeting = greeting();
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

const greeting = function () {
  let message;

  const date = new Date().getHours();
  if (date > 18 || date < 3) {
    message = "good evening 🌙";
  } else if (date > 3 && date < 12) {
    message = "good morning ☀️";
  } else {
    message = "good afternoon 🌅";
  }

  return message;
};

// Express Router
app.use("/", usersRoutes);
app.use("/home", homeRoutes);
app.use("/todo", todoRoutes);
app.use("/food", foodRoutes);

// Routing errors
app.all("*", (req, res, next) => {
  // If all previous route handlers did not work, app.all will run
  next(new ExpressError(404, "Page Not Found"));
});

// Error-handling
app.use((err, req, res, next) => {
  const { status = 500, message = "Something went wrong" } = err; // Express error has err.status by default when an error occurs
  // console.log(err);
  res.status(status).render("partials/error", { err });
});

const port = 3000;
app.listen(port, () => {
  console.log(`Serving app on port ${port}`);
});
