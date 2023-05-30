const User = require("../model/user");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator")

exports.register_user_post = [
   

  
    // Process request after validation and sanitization.
    asyncHandler(async (req, res, next) => {
      try {
        const errors = validationResult(req);
  
        const user = new User({
          firstname: req.body.firstname,
          lastname: req.body.lastname,
          email: req.body.email,
          password: req.body.password,
         
        });
  
        
  
        // Save the product.
        await user.save();
        // Redirect to the new product record.
        
      } catch (err) {
        next(err);
      }
    }),
  ];