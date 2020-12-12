const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt-nodejs");

// Define our model
const serviceSchema = new Schema({
  name: { type: String },
  description: { type: String },
  approxCost: { type: Number },
  type: [{type: Object}],
  isSkilled: {type: Boolean, default: false},
});


// Create the model class
const ModelClass = mongoose.model("service", serviceSchema);

// Export the model
module.exports = ModelClass;
