const User = require("../models/user");
const Feedback = require("../models/feedback");
const axios = require("axios");
/**
 * Fetch profile information
 *
 * @param req
 * @param res
 * @param next
 */
exports.postFeedback = async function (req, res, next) {
  const { feedbackText, fagentID, custID, workID, ratingForWork } = req.body;
  if (feedbackText != "" || ratingForWork != "") {
    axios
      .post(`https://inout-mldl-pack.herokuapp.com/sentiment`, {
        text: feedbackText,
      })
      .then((response) => {
        let pred_sentiment = response.data[0];
        let confidence = response.data[1];
        let obj = {
          sentiment: pred_sentiment,
          confidence: confidence,
        };
        Feedback.create({
          fromID: custID,
          toID: fagentID,
          workID: workID != "" ? workID : null, //5489234587245784 or ""->general
          feedbackText: feedbackText,
          ratingForWork: ratingForWork,
          sentiment: obj,
        }).then((fb) => {
          res.send(fb);
        });
      });
  } else {
    res.send({ msg: "send feedbacktext or ratingforwork" });
  }
};

exports.getFeedback = async function (req, res, next) {
  Feedback.find({ toID: req.params.id })
    .populate(
      "fromID",
      "_id firstName lastName email phone occupation description skills"
    )
    .populate(
      "toID",
      "_id firstName lastName email phone occupation description skills"
    )
    .populate("workID", "name description cost completedtransaction")
    .then((f) => {
      //console.log(f);
      res.send(f);
    });
};
