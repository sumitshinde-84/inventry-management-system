const User = require("../model/user");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const passport = require('passport');
const bcrypt = require('bcryptjs');

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

      // Registration successful
      return res.status(200).json({ message: "Registration successful" });
    } catch (err) {
      // Error occurred while registering
      console.error(err);
      return res.status(500).json({ error: "Registration failed" });
    }
  })
];

exports.login_user_post = (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    try {
      if (err) {
        throw err;
      }

      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      req.login(user, { session: false }, (err) => {
        if (err) {
          throw err;
        }

        return res.status(200).json({ message: "Login successful" });
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Login failed" });
    }
  })(req, res, next);
};

exports.user_list = asyncHandler(async (req, res, next) => {
  const allUsers = await User.find({}).exec();

  if (allUsers.length === 0) {
    const err = new Error('Users not found');
    err.status = 404;
    return next(err);
  }

  const responseData = {
    title: 'Users',
    content: 'user_list',
    users: allUsers
  };

  res.render('layout', responseData);
});
