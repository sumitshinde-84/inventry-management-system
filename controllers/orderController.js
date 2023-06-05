const Order = require('../model/order');
const asyncHandler = require("express-async-handler");
const User = require('../model/user');

const { body, validationResult } = require("express-validator");

exports.order_post = asyncHandler(async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, cart, status, totalPrice, paymentStatus } = req.body;

    const user = await User.find({ email: username }).exec();

    const newOrder = new Order({
    //   user,
    //   totalPrice,
      status,
      paymentStatus,
      cart
    });

  
    await newOrder.save();

   
    return res.status(200).json({ message: "Order creation successful" });
  } catch (err) {
   
    console.error(err);
    return res.status(500).json({ error: "Order creation failed" });
  }
});
