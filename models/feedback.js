const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt-nodejs");

// Define our model
const feedbackSchema = new Schema({
  fromID: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  toID: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  workID: { type: mongoose.Schema.Types.ObjectId, ref: "work" },
  feedbackText: { type: String },
  ratingForWork: { type: Number },
  sentiment: { type: Object },
});

// Create the model class
const ModelClass = mongoose.model("feedback", feedbackSchema);

// Export the model
module.exports = ModelClass;
