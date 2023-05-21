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
    try {
      const categories = await Category.find().exec();
  
      res.render("layout", {
        title: "Create Product",
        content: "product_form",
        product: {}, // Pass an empty product object to initialize the form fields
        categories: categories, // Pass the categories to the template
        errors: [], // Initialize the errors array to avoid errors in the template
      });
    } catch (err) {
      next(err);
    }
  });
  
  // Handle product create on POST.
  exports.product_create_post = [
    // Validate and sanitize fields.
    body("name")
      .trim()
      .isLength({ min: 1 })
      .escape()
      .withMessage("Product name must be specified.")
      .withMessage("Product name has non-alphanumeric characters."),
    body("description")
      .trim()
      .isLength({ min: 1 })
      .escape()
      .withMessage("Description must be specified."),
    body("units").isNumeric().withMessage("Invalid units"),
    body("price").isNumeric().withMessage("Invalid price"),
    body("category")
      .trim()
      .isLength({ min: 1 })
      .escape()
      .withMessage("Category must be specified."),
  
    // Process request after validation and sanitization.
    asyncHandler(async (req, res, next) => {
      try {
        // Extract the validation errors from the request.
        const errors = validationResult(req);
  
        // Create a Product object with escaped and trimmed data.
        const product = new Product({
          name: req.body.name,
          description: req.body.description,
          units: req.body.units,
          price: req.body.price,
          category: req.body.category,
        });
  
        if (!errors.isEmpty()) {
          const categories = await Category.find().exec();
  
          // There are errors. Render the form again with sanitized values and error messages.
          res.render("layout", {
            title: "Create Product",
            content: "product_form",
            product: product,
            categories: categories,
            errors: errors.array(),
          });
          return;
        }
  
        // Save the product.
        await product.save();
        // Redirect to the new product record.
        res.redirect(product.url);
      } catch (err) {
        next(err);
      }
    }),
  ];
  
// Display product delete form on GET.
exports.product_delete_get = asyncHandler(async (req, res, next) => {
    const product = await Product.findById(req.params.id).find().exec()

    if(product==null){
        res.redirect('/catalog/categories')
    }
    res.render('')
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
