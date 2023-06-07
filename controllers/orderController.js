const Order = require("../model/order");
const asyncHandler = require("express-async-handler");
const User = require("../model/user");

const { body, validationResult } = require("express-validator");

exports.order_post = asyncHandler(async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      username,
      cart,
      status,
      totalPrice,
      paymentStatus,
      addressFormData,
    } = req.body;

    const user = await User.findOne({ email: username }).exec();

    const newOrder = new Order({
      user,
      totalPrice,
      status,
      paymentStatus,
      cart,
      addressAndContact: addressFormData,
    });

    await newOrder.save();

    return res.status(200).json({ message: "Order creation successful" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Order creation failed" });
  }
});

exports.order_list = asyncHandler(async(req, res , next)=>{
  allOrder = await Order.find().populate('user').exec()

  if(allOrder===null){
    const err = new Error('orders not found')
    err.status=404
    next(err)
  }

  res.render('layout',{
    title:'Orders',
    content:'order_list',
    orders:allOrder
  })

})


exports.order_update_get = asyncHandler(async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).exec();

    if (!order) {
      const err = new Error('Order not found');
      err.status = 404;
      throw err;
    }

    res.render('layout', {
      content:'order_form',
      order: order
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Order update failed' });
  }
});


exports.order_update = asyncHandler(async (req, res, next) => {
  try {
    const { orderId, status, paymentStatus } = req.body;

    const order = await Order.findById(orderId).exec();

    if (!order) {
      
      const err = new Error('Order not found');
      err.status = 404;
      throw err;
    }

    
    order.status = status;
    order.paymentStatus = paymentStatus;

   
    await order.save();

    return res.status(200).json({ message: 'Order updated successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Order update failed' });
  }
});



