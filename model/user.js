const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  firstname: { type: String, required: true },
  lastname: {type: String, required: true },
  email: { type: String, required: true ,unique: true },
  password: { type: String, required: true },
 
});

UserSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/catalog/user/${this._id}`;
});


// Export model
module.exports = mongoose.model("User", UserSchema);