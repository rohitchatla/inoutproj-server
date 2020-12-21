const User = require("../models/user");
const axios = require("axios");
/**
 * Fetch profile information
 *
 * @param req
 * @param res
 * @param next
 */
exports.fetchProfile = function (req, res, next) {
  // Require auth

  // Return profile info
  //console.log(req.user);

  const user = {
    email: req.user.email,
    isAgent: req.user.isAgent,
    firstName: req.user.firstName,
    lastName: req.user.lastName,
    birthday: req.user.birthday,
    sex: req.user.sex,
    phone: req.user.phone,
    address: req.user.address,
    occupation: req.user.occupation,
    description: req.user.description,
    photo: req.user.photo,
    aadharcard: req.user.aadharcard,
    aadharcardb64: req.user.aadharcardb64,
    aadhardetails: req.user.aadhardetails,
    rating: req.user.rating,
  };
  res.send({
    user: user,
  });
};

exports.fetchProfileById = function (req, res, next) {
  // Require auth

  // Return profile info
  //console.log(req.user);

  User.findById(req.params.id).then((user) => {
    res.send({
      user,
    });
  });
};

exports.allprofilesagent = function (req, res, next) {
  User.find({ isAgent: true }).then((user) => {
    res.send({
      user,
    });
  });
};

exports.allprofilescust = function (req, res, next) {
  User.find({ isAgent: false }).then((user) => {
    res.send({
      user,
    });
  });
};

exports.profiledet = function (req, res, next) {
  User.findById(req.params.id).then((user) => {
    res.send({
      user,
    });
  });
};

/**
 * Update profile information
 *
 * @param req
 * @param res
 * @param next
 */
exports.updateProfile = function (req, res, next) {
  // Require auth

  // Get new profile info (user input)
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const birthday = req.body.birthday;
  const sex = req.body.sex;
  const phone = req.body.phone;
  const address = req.body.address;
  const occupation = req.body.occupation;
  const description = req.body.description;
  const image = req.file;

  // Get user
  const user = req.user;
  console.log(user);
  // Update user profile
  User.findByIdAndUpdate(
    user._id,
    {
      $set: {
        firstName: firstName,
        lastName: lastName,
        birthday: birthday,
        sex: sex,
        phone: phone,
        address: address,
        occupation: occupation,
        description: description,
        photo: req.file.filename,
      },
    },
    { new: true },
    function (err, updatedUser) {
      if (err) {
        return next(err);
      }
      // Delete unused properties: _id, password, __v
      updatedUser = updatedUser.toObject();
      delete updatedUser["_id"];
      delete updatedUser["password"];
      delete updatedUser["__v"];
      // Return updated user profile
      res.send({ user: updatedUser });
    }
  );
};

/**
 * Reset password
 *
 * @param req
 * @param res
 * @param next
 */
exports.resetPassword = function (req, res, next) {
  // Require auth

  const oldPassword = req.body.oldPassword;
  const newPassword = req.body.newPassword;
  const user = req.user;

  // Compare passwords - Does the user provide correct old password?
  user.comparePassword(oldPassword, function (err, isMatch) {
    if (err) {
      return next(err);
    }

    if (!isMatch) {
      return res
        .status(422)
        .send({ message: "You old password is incorrect! Please try again." });
    }

    if (oldPassword === newPassword) {
      return res.status(422).send({
        message: "Your new password must be different from your old password!",
      });
    }

    // Update password
    user.password = newPassword;

    // Save to DB
    user.save(function (err) {
      if (err) {
        return next(err);
      }

      // Respond user request indicating that the password was updated successfully
      res.json({ message: "You have successfully updated your password." });
    });
  });
};

exports.updateAgent = function (req, res, next) {
  //console.log(req.body);
  const {
    uid,
    phno,
    sex,
    description,
    address,
    occupation,
    birthday,
    skills,
    b64url,
  } = req.body;

  // User.findById(uid).then((user) => {
  //   user.phone = phno;
  //   user.sex = sex;
  //   user.description = description;
  //   user.occupation = occupation;
  //   user.address = address;
  //   user.birthday = birthday;
  //   user.isAgent = true;
  //   user.skills = skills;
  //   user.save().then((u) => {
  //     //changing password(/w hash)(as in user model after saving on function runs which changes hash and ultimately password of the user) causing login prob so commented
  //     res.send(u);
  //   });
  // });

  //   var objForUpdate = {};

  // if (req.body.nome) objForUpdate.nome = req.body.nome;
  // if (req.body.cognome) objForUpdate.cognome = req.body.cognome;
  // if (req.body.indirizzo) objForUpdate.indirizzo = req.body.indirizzo;

  // //before edit- There is no need for creating a new variable
  // //var setObj = { $set: objForUpdate }

  // objForUpdate = { $set: objForUpdate }

  // collection.update({_id:ObjectId(req.session.userID)}, objForUpdate })

  axios
    .post(`https://inout-mldl-pack.herokuapp.com/aadhar_ocr`, {
      text: "aadhar.jpg",
      payload: b64url.substring(b64url.indexOf(",") + 1),
    })
    .then((response) => {
      let data = {};
      console.log(response.data);
      if (response.data) {
        data = response.data;
      }

      User.findByIdAndUpdate(
        uid,
        {
          $set: {
            phone: phno,
            sex: sex,
            birthday: birthday,
            description: description,
            occupation: occupation,
            address: address,
            birthday: birthday,
            isAgent: true,
            skills: skills,
            aadharcard: req.file.filename,
            aadharcardb64: b64url.substring(b64url.indexOf(",") + 1),
            aadhardetails: data,
          },
        },
        { new: true },
        function (err, updatedUser) {
          if (err) {
            return next(err);
          }
          // Delete unused properties: _id, password, __v
          updatedUser = updatedUser.toObject();
          delete updatedUser["_id"];
          delete updatedUser["password"];
          delete updatedUser["__v"];
          // Return updated user profile
          res.send({ user: updatedUser });
        }
      );
    })
    .catch(({ response }) => {});
};
