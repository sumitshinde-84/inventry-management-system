const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ProductSchema = new Schema({
  name: { type: String, required: true },
  category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
  description: { type: String, required: true ,maxLength:200 },
  price: { type: Number, required: true },
  units: { type: Number, required: true },
  image: {
    type: String,

  },
});

// Virtual for book's URL
ProductSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/catalog/product/${this._id}`;
});

// Export model
module.exports = mongoose.model("Product", ProductSchema);
