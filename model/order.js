const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const OrderSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    cart: { type: Array, required: true },
    status: { type: String, required: true },
    paymentStatus: { type: String, required: true },
    // totalPrice: { type: Number, required: true }
  },
  { timestamps: true }
);

OrderSchema.virtual("url").get(function() {
  return `/catalog/order/${this._id}`;
});

module.exports = mongoose.model("Order", OrderSchema);
