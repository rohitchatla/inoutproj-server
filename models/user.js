const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt-nodejs");

const SavedCard = new Schema({
  stripe_customer_id: {
    type: String,
    required: [true, "stripe_customer_id is required"],
  },
  card_brand: {
    type: String,
    required: [true, "card_brand is required"],
  },
  last_four_digit: {
    type: String,
    required: [true, "last_four_digit is required"],
  },
  exp_month: {
    type: String,
    required: [true, "exp_month is required"],
  },
  exp_year: {
    type: String,
    required: [true, "exp_year is required"],
  },
});

// Define our model
const userSchema = new Schema({
  //userDetails
  email: { type: String, unique: true, lowercase: true },
  password: String,
  firstName: String,
  lastName: String,
  birthday: { type: String, default: "" },
  sex: { type: String, default: "" }, // secrecy/male/female
  phone: { type: String, default: "" },
  address: { type: String, default: "" },
  occupation: { type: String, default: "" },
  description: { type: String, default: "" },

  //agentDetails
  isAgent: { type: Boolean, default: false },
  skills: { type: String, default: "" },
  isWorking: { type: Boolean, default: false },
  currentWorking: { type: mongoose.Schema.Types.ObjectId, ref: "work" },
  savedCards: [SavedCard],
  photo: { type: String },
  aadharcard: { type: String },
  aadharcardb64: { type: String },
  aadhardetails: { type: Object },
  rating: { type: Number, default: 0 },
});

// On Save Hook, encrypt the password
userSchema.pre("save", function (next) {
  // before saving the model, run this funtion

  const user = this; // get access to the user model
  //console.log(user);
  bcrypt.genSalt(10, function (err, salt) {
    // generate a salt, then run callback

    if (err) {
      return next(err);
    }

    // hash (encrypt) our password using the salt
    bcrypt.hash(user.password, salt, null, function (err, hash) {
      if (err) {
        return next(err);
      }

      // overwrite plain text password with encrypted password
      user.password = hash;

      // go ahead and save the model
      next();
    });
  });
});

// userSchema.methods: Whenever we create a user object, it's going to have access to any functions that we define on this methods property
userSchema.methods.comparePassword = function (candidatePassword, callback) {
  // used in LocalStrategy

  // candidatePassword will be encrypted internally in this function
  // console.log(candidatePassword);
  // console.log(this.password);

  bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
    if (err) {
      return callback(err);
    }
    //console.log(isMatch);
    callback(null, isMatch);
  });
};

// Create the model class
const ModelClass = mongoose.model("user", userSchema);

// Export the model
module.exports = ModelClass;
