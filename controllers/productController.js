const Category = require("../models/category");
const Product = require("../models/product");

const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");

exports.index = asyncHandler(async (req, res, next) => {
  // Get details of books, book instances, authors and genre counts (in parallel)
  const [numProduct, numCategory] = await Promise.all([
    Category.countDocuments({}).exec(),
    Product.countDocuments({}).exec(),
  ]);

  res.render("layout", {
    title: "Inventory Home Page",
    content: "index",
    product_count: numProduct,
    category_count: numCategory,
  });
});

// Display list of all products.
exports.product_list = asyncHandler(async (req, res, next) => {
 const allProducts = await Product.find({}, "name price")
 .sort({ title: 1 })
 .populate("category")
 .exec();

 if(allProducts==null){
    const err = new Error('products are not found')
    err.status= 404
    next(err)
 }

 res.render('layout',{
    title:'Products',
    products:allProducts,
    content:'product_list'
 })
});

exports.product_list_send_json = asyncHandler(async (req, res, next) => {
    const allProducts = await Product.find({}, "name price")
    .sort({ title: 1 })
    .populate("category")
    .exec();
   
    if(allProducts==null){
       const err = new Error('products are not found')
       err.status= 404
       next(err)
    }
    
    const responceData = {
       
        products:allProducts,
       
     }
    
    res.json(responceData)
   });

// Display detail page for a specific product.
exports.product_detail = asyncHandler(async (req, res, next) => {
  const product =  await Product.findById(req.params.id).populate('category').exec()
  
  if(product === null){
    const err = new  Error('item not found');
    err.status=404
    next(err)
  }

  res.render('layout',{
    content:'product_detail',
    product:product
  })
});

// Display product create form on GET.
exports.product_create_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: product create GET");
});

// Handle product create on POST.
exports.product_create_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: product create POST");
});

// Display product delete form on GET.
exports.product_delete_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: product delete GET");
});

// Handle product delete on POST.
exports.product_delete_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: product delete POST");
});

// Display product update form on GET.
exports.product_update_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: product update GET");
});

// Handle product update on POST.
exports.product_update_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: product update POST");
});
