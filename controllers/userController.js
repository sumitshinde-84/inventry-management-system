const User = require("../model/user");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

exports.register_user_post = [
  // Validate and sanitize request body fields
  body("firstname").trim().notEmpty().withMessage("First name must be specified."),
  body("lastname").trim().notEmpty().withMessage("Last name must be specified."),
  body("email").trim().isEmail().withMessage("Invalid email address."),
  body("password").trim().notEmpty().withMessage("Password must be specified."),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    try {
      const errors = validationResult(req);

      

      const { firstname, lastname, email, password } = req.body;

      const user = new User({
        firstname,
        lastname,
        email,
        password,
      });

      // Save the user.
      await user.save();

      // Registration successful
      return res.status(200).json({ message: "Registration successful" });
    } catch (err) {
      // Error occurred while registering
      return res.status(500).json({ error: "Registration failed" });
    }
  }),

  // Add a fallback response if the route is accessed directly
  (req, res) => {
    return res.status(404).json({ error: "Page not found" });
  }
];
