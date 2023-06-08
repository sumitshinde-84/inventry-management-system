const Category = require("../model/category");
const Product = require("../model/product");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });
const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");

exports.index = asyncHandler(async (req, res, next) => {
  const [numCategory, numProduct] = await Promise.all([
    Category.countDocuments({}).exec(),
    Product.countDocuments({}).exec(),
  ]);

  res.render("layout", {
    title: "Dashboard",
    content: "index",
    product_count: numProduct,
    category_count: numCategory,
  });
});

// Display list of all products.
exports.product_list = asyncHandler(async (req, res, next) => {
  const allProducts = await Product.find({})
    .sort({ title: 1 })
    .populate("category")
    .exec();

  if (allProducts == null) {
    const err = new Error("products are not found");
    err.status = 404;
    next(err);
  }

  res.render("layout", {
    title: "Products",
    products: allProducts,
    content: "product_list",
  });
});

exports.product_list_send_json = asyncHandler(async (req, res, next) => {
  const allProducts = await Product.find()
    .sort({ title: 1 })
    .populate("category")
    .exec();

  if (allProducts == null) {
    const err = new Error("products are not found");
    err.status = 404;
    next(err);
  }

  const responceData = {
    products: allProducts,
  };

  res.json(responceData);
});

// Display detail page for a specific product.
exports.product_detail = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id)
    .populate("category")
    .exec();

  if (product === null) {
    const err = new Error("item not found");
    err.status = 404;
    next(err);
  }

  res.render("layout", {
    content: "product_detail",
    product: product,
  });
});

// Display product create form on GET.
exports.product_create_get = asyncHandler(async (req, res, next) => {
  try {
    const categories = await Category.find().exec();

    res.render("layout", {
      title: "Create Product",
      content: "product_form",
      product: {},
      categories: categories,
      errors: [],
    });
  } catch (err) {
    next(err);
  }
});

exports.product_create_post = [
  upload.single("image"),

  // Validate and sanitize fields.
  body("name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Product name must be specified."),
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
      const errors = validationResult(req);

      const product = new Product({
        name: req.body.name,
        description: req.body.description,
        units: req.body.units,
        price: req.body.price,
        category: req.body.category,
        image: req.file ? req.file.filename : null,
      });

      if (!errors.isEmpty()) {
        const categories = await Category.find().exec();

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
  const product = await Product.findById(req.params.id).find().exec();

  if (product == null) {
    res.redirect("/catalog/categories");
  }
  res.render("layout", {
    content: "product_delete",
    product: product,
  });
});

// Handle product delete on POST.
exports.product_delete_post = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id).find().exec();

  if (product == null) {
    res.redirect("/catalog/products");
    return;
  }
  await Product.findByIdAndRemove(req.params.id);
  res.redirect("/catalog/products");
});

// Display product update form on GET.
exports.product_update_get = asyncHandler(async (req, res, next) => {
  const [product, categories] = await Promise.all([
    Product.findById(req.params.id).exec(),
    Category.find().find().exec(),
  ]);

  if (product === null) {
    // No results.
    const err = new Error("product not found");
    err.status = 404;
    return next(err);
  }
  res.render("layout", {
    title: "Create Product",
    content: "product_form",
    product: product,
    categories: categories,
  });
});

// Handle product update on POST.
exports.product_update_post = [
  // Use multer middleware to handle file upload
  upload.single("image"),

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
      const errors = validationResult(req);

      const product = new Product({
        _id: req.params.id,
        name: req.body.name,
        description: req.body.description,
        units: req.body.units,
        price: req.body.price,
        category: req.body.category,
        image: req.file ? req.file.filename : null,
      });

      if (!errors.isEmpty()) {
        res.render("layout", {
          title: "Create Product",
          content: "product_form",
          product: product,
          categories: categories,
          errors: errors.array(),
        });
        return;
      } else {
        // Data from form is valid. Update the record.
        const theproduct = await Product.findByIdAndUpdate(
          req.params.id,
          product,
          {}
        );
        // Redirect to category detail page.
        res.redirect(theproduct.url);
      }
    } catch (err) {
      next(err);
    }
  }),
];
