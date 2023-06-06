const User = require("../model/user");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const passport = require('passport');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Function to generate a JWT token
const generateToken = (user) => {
  const payload = {
    _id: user._id,
    email: user.email
  };

  const token = jwt.sign(payload, 'your-secret-key', { expiresIn: '1h' });
  return token;
};

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

      // Generate JWT token
      const token = generateToken(user);

      // Registration successful
      return res.status(200).json({
        message: "Registration successful",
        user: {
          _id: user._id,
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
        },
        token: token
      });
    } catch (err) {
      // Error occurred while registering
      console.error(err);
      return res.status(500).json({ error: "Registration failed" });
    }
  }),

  (req, res) => {
    return res.status(404).json({ error: "Page not found" });
  },
];

exports.login_user_post = [
  passport.authenticate("local", { session: false }),
  asyncHandler(async (req, res, next) => {
    try {
      // Generate JWT token
      const token = generateToken(req.user);

      return res.status(200).json({
        message: "Login successful",
        user: {
          _id: req.user._id,
        },
        token: token
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Login failed" });
    }
  }),
];

exports.user_list = asyncHandler(async (req, res, next) => {
  const allUsers = await User.find({}).exec();

  if (allUsers === null) {
    const err = new Error("Users not found");
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
