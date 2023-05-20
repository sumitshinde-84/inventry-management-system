const Category = require("../models/category");
const asyncHandler = require("express-async-handler");
const Product = require("../models/product");

// Display list of all categories.
exports.category_list = asyncHandler(async (req, res, next) => {
  const allCategory = await Category.find({},'name').exec()

  if(allCategory === null){
    const err = new Error('categories not found')
    err.status = 404
    next(err)
  }
  const responceData = {
    title:'Categories',
    content:'category_list',
    categories:allCategory
  }
  
  res.render('layout',responceData)
});

exports.category_list_send_json = asyncHandler(async (req, res, next) => {
    const allCategory = await Category.find({},'name').exec()
  
    if(allCategory === null){
      const err = new Error('categories not found')
      err.status = 404
      next(err)
    }
    const responceData = {
      title:'Categories',
      content:'category_list',
      categories:allCategory
    }
    
    res.json(responceData)
  });

// Display detail page for a specific category.
exports.category_detail = asyncHandler(async (req, res, next) => {
 const [category,productsBycategory] = await Promise.all([
    Category.findById(req.params.id,"name description").exec(),
    Product.find({category:req.params.id}).exec()
 ])

 if(category==null){
    const err = new Error('category not found')
    err.status = 404;
    next(err)
 }

 res.render("layout", {
    content:'category_detail',
    category:category,
    products:productsBycategory,

  });
});

// Display category create form on GET.
exports.category_create_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: category create GET");
});

// Handle category create on POST.
exports.category_create_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: category create POST");
});

// Display category delete form on GET.
exports.category_delete_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: category delete GET");
});

// Handle category delete on POST.
exports.category_delete_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: category delete POST");
});

// Display category update form on GET.
exports.category_update_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: category update GET");
});

// Handle category update on POST.
exports.category_update_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: category update POST");
});
