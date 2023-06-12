const User = require("../model/user");
const Order =require("../model/order")
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const passport = require("passport");
const bcrypt = require("bcryptjs");
const order = require("../model/order");

exports.register_user_post = [
  // Validate and sanitize request body fields
  body("firstname")
    .trim()
    .notEmpty()
    .withMessage("First name must be specified."),
  body("lastname")
    .trim()
    .notEmpty()
    .withMessage("Last name must be specified."),
  body("email").trim().isEmail().withMessage("Invalid email address."),
  body("password").trim().notEmpty().withMessage("Password must be specified."),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        // There are validation errors
        return res.status(400).json({ errors: errors.array() });
      }

      const { firstname, lastname, email, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({
        firstname,
        lastname,
        email,
        password: hashedPassword,
      });

      await user.save();

      // Registration successful
      return res.status(200).json({ message: "Registration successful" });
    } catch (err) {
      // Error occurred while registering
      console.error(err);
      return res.status(500).json({ error: "Registration failed" });
    }
  }),

  // Add a fallback response if the route is accessed directly
  (req, res) => {
    return res.status(404).json({ error: "Page not found" });
  },
];

exports.login_user_post = passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/",
});

exports.user_list = asyncHandler(async (req, res, next) => {
  const allUsers = await User.find({}).exec();

  if (allUsers === null) {
    const err = new Error("users not found");
    err.status = 404;
    next(err);
  }
  const responseData = {
    title: "Users",
    content: "user_list",
    users: allUsers,
  };

  res.render("layout", responseData);
});


exports.user_detail = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id).exec();
  const order = await Order.find({"user":user._id}).exec()
  if (user === null) {
    const err = new Error("user not found");
    err.status = 404;
    next(err);
  }
  if (order === null) {
    const err = new Error("order not found");
    err.status = 404;
    next(err);
  }

  res.render("layout", {
    content: "user_detail",
    user: user,
    orders:order
  });
});

