#! /usr/bin/env node


  const userArgs = process.argv.slice(2);
  
  const Product = require("./models/product");
  const Category = require("./models/category");
  
  
  const  categories = [];
  const products = [];
  
  
  const mongoose = require("mongoose");
  mongoose.set("strictQuery", false); 
  
  const mongoDB = userArgs[0];
  
  main().catch((err) => console.log(err));
  
  async function main() {
    console.log("Debug: About to connect");
    await mongoose.connect(mongoDB);
    console.log("Debug: Should be connected?");
    await createCategory();
    await createProduct();
   
    console.log("Debug: Closing mongoose");
    mongoose.connection.close();
  }
  
  async function categoryCreate(name,description) {
    const category = new Category({ name:name,description:description });
    await category.save();
    categories.push(category);
    console.log(`Added category: ${name}`);
  }
  
  
  
  async function productCreate(name, category, description,price, units) {
    const productdetail = {
        name:name,
         category:category, 
         description:description,
         price:price,
          units:units
    };
    if (category != false) productdetail.category = category;
  
    const product = new Product(productdetail);
    await product.save();
    products.push(product);
    console.log(`Added product: ${name}`);
  }

  async function createCategory() {
    console.log("Adding Categories");
    await Promise.all([
    categoryCreate("Sneakers", "Comfortable and stylish footwear suitable for casual and athletic activities."),
    categoryCreate("Sport Shoes", "Designed specifically for sports and physical activities, providing support and performance."),
    categoryCreate("Casual Shoes", "Versatile footwear for everyday wear, combining style and comfort."),
    ]);
    }

    async function createProduct() {
        console.log("Adding Products");
        await Promise.all([
          productCreate(
            "Running Shoes",
            categories[0], 
            "Lightweight and cushioned shoes designed for running and jogging.",
            59.99,
            100
          ),
          productCreate(
            "Basketball Shoes",
            categories[1], 
            "High-top sneakers with ankle support for basketball players.",
            89.99,
            50
          ),
          productCreate(
            "Loafers",
            categories[2], 
            "Slip-on shoes suitable for both formal and casual occasions.",
            79.99,
            80
          ),
        ]);
      }
