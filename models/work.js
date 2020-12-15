const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt-nodejs");

const statusSchema = new Schema({
  //when work posted it customerRequested:true
  customerRequested: { type: Boolean, default: false },
  agentRequested: { type: Boolean, default: false },
  customerAccepted: { type: Boolean, default: false },
  customerCancelled: { type: Boolean, default: false },
  agentCancelled: { type: Boolean, default: false },
  workDone: { type: Boolean, default: false },
  //agentAccepted: { type: Boolean, default: false }, will be lengthy process inview of customer
});

const workStatusSchema = new Schema({
  //not started beforehand
  workOngoing: { type: Boolean, default: false }, //or started
  workCancelled: { type: Boolean, default: false },
  workCompleted: { type: Boolean, default: false },
});

// Define our model
const workSchema = new Schema({
  name: { type: String },
  //photo: { type: Buffer },
  photo: { type: String },
  description: { type: String },
  cost: { type: Number },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  agentId: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
  finalagentId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "service" },
  isCust: { type: Boolean, default: true },
  isSkilled: { type: Boolean, default: false },
  status: [statusSchema],
  currentstatus: { type: String },
  currentworkstatus: { type: String },
  isWork: { type: Boolean, default: false },
  workstatus: [workStatusSchema],
  postedBy: { type: String }, //cust or agent
  completedtransaction: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "transactions",
    },
  ],
});

// Create the model class
const ModelClass = mongoose.model("work", workSchema);

// Export the model
module.exports = ModelClass;
