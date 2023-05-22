const Category = require("../model/category");
const asyncHandler = require("express-async-handler");
const Product = require("../model/product");
const { body, validationResult } = require("express-validator");


// Display list of all categories.
exports.category_list = asyncHandler(async (req, res, next) => {
  const allCategory = await Category.find({}).exec()

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
    res.render("layout", {
      title: "Create Category",
      content: "category_form",
      category: {}, // Pass an empty category object to initialize the form fields
    });
  });
  
  // Handle category create on POST.
  exports.category_create_post = [
    // Validate and sanitize the name field.
    body("name", "Category name must contain at least 3 characters")
      .trim()
      .isLength({ min: 3 })
      .escape(),
    body("description", "Description must contain at least 20 characters")
      .trim()
      .isLength({ min: 20 })
      .escape(),
  
    asyncHandler(async (req, res, next) => {
      const errors = validationResult(req);
  
      // Create a category object with escaped and trimmed data.
      const category = new Category({
        name: req.body.name,
        description: req.body.description,
      });
  
      if (!errors.isEmpty()) {
        // There are errors. Render the form again with sanitized values/error messages.
        res.render("layout", {
          title: "Create Category",
          content: "category_form",
          category: category,
          errors: errors.array(),
        });
        return;
      } else {
        // Data from form is valid.
        // Check if Category with the same name already exists.
        const categoryExists = await Category.findOne({ name: req.body.name }).exec();
        if (categoryExists) {
          res.redirect(categoryExists.url);
        } else {
          await category.save();
          res.redirect(category.url);
        }
      }
    }),
  ];
  

// Display category delete form on GET.
exports.category_delete_get = asyncHandler(async (req, res, next) => {
 
    const [category,productsBycategory] = await Promise.all([
        Category.findById(req.params.id).exec(),
        Product.find({category:req.params.id},"name description").exec()
    ])

    if(category ==null){
        res.redirect('catalog/categories')
    }

    res.render('layout',{
        content:'category_delete',
        category:category,
        products:productsBycategory
    })
});

// Handle category delete on POST.
exports.category_delete_post = asyncHandler(async (req, res, next) => {
  const [category, productsByCategory] = await Promise.all([
    Category.findById(req.params.id).exec(),
    Product.find({ category: req.params.id }, "name description").exec()
  ]);

  if (productsByCategory.length > 0) {
    res.render('layout', {
      content: 'category_delete',
      products: productsByCategory,
      category: category
    });
  } else {
    await Category.findByIdAndRemove(req.params.id);
    res.redirect('/catalog/categories');
  }
});


// Display category update form on GET.
exports.category_update_get = asyncHandler(async (req, res, next) => {
    const category = await Category.findById(req.params.id).exec()
        
      
    
      if (category === null) {
        // No results.
        const err = new Error("category not found");
        err.status = 404;
        return next(err);
      }
    
     
      res.render("layout", {
        content:'category_form',
        title:'Update Category',
        category:category
      });
});

// Handle category update on POST.
exports.category_update_post = asyncHandler(async (req, res, next) => {
    // Validate and sanitize fields.
    body("name", "Category name must contain at least 3 characters")
      .trim()
      .isLength({ min: 3 })
      .escape(),
    body("description", "Description must contain at least 20 characters")
      .trim()
      .isLength({ min: 20 })
      .escape();
  
    const errors = validationResult(req);
  
    const category = new Category({
        _id:req.params.id,
      name: req.body.name,
      description: req.body.description,
    });
  
    if (!errors.isEmpty()) {
      res.render("layout", {
        title: "Create Category",
        content: "category_form",
        category: category,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid. Update the record.
      const thecategory = await Category.findByIdAndUpdate(req.params.id, category, {});
      // Redirect to category detail page.
      res.redirect(thecategory.url);
    }
  });
  
