const Work = require("../models/work");
const Services = require("../models/services");
const User = require("../models/user");

/**
 * Fetch profile information
 *
 * @param req
 * @param res
 * @param next
 */
// exports.postWork = function (req, res, next) {
//   console.log(req.body);
// };

// exports.photo = async function (req, res, next) {
//   // console.log("called");
//   res.set("Content-Type", req.contentType);
//   return res.send(req.data);
// };

exports.fetchWorks = async function (req, res, next) {
  const allworks = await Work.find({});

  if (!allworks) res.send({ error: "No works available" });

  res.send(allworks);
};

exports.fetchWorksbyUid = async function (req, res, next) {
  const allmyworks = await Work.find({ userId: req.params.id });

  if (!allmyworks) res.send({ error: "No works available" });

  res.send(allmyworks);
};

exports.fetchWorksbyid = async function (req, res, next) {
  const allworks = await Work.findById(req.params.id)
    .populate(
      "agentId",
      "_id firstName lastName email phone occupation description skills"
    )
    .exec();

  if (!allworks) res.send({ error: "No works available" });

  res.send(allworks);
};

exports.serviceid2service = async function (req, res, next) {
  const service = await Services.findById(req.params.id);

  if (!service) res.send({ error: "No service available" });

  res.send(service);
};

exports.agentrequested = async function (req, res, next) {
  const { agentid, wid } = req.body;
  Work.findById(wid)
    .then((work) => {
      if (!work) res.send({ error: "No work available" });

      work.status[0].agentRequested = true;
      work.agentId = agentid;
      work.save().then((w) => {
        User.findById(agentid).then((agent) => {
          agent.isWorking = true;
          agent.currentWorking = w._id;
          agent.save();
        });
      });
    })
    .catch(() => {});
};

exports.custaccepted = async function (req, res, next) {
  const { custid, wid } = req.body;

  Work.findById(wid)
    .then((work) => {
      if (!work) res.send({ error: "No work available" });

      work.status[0].customerAccepted = true;
      work.workstatus[0].workOngoing = true;
      work.save().then((w) => {
        res.send(w);
      });
    })
    .catch(() => {});
};

exports.custrejected = async function (req, res, next) {
  const { custid, wid } = req.body;

  Work.findById(wid)
    .then((work) => {
      if (!work) res.send({ error: "No work available" });

      work.status[0].customerAccepted = false;
      work.status[0].agentRequested = false;
      work.workstatus[0].workCancelled = true;
      work.save().then((w) => {
        res.send(w);
      });
    })
    .catch(() => {});
};

exports.workdone = async function (req, res, next) {
  const { custid, wid } = req.body;

  Work.findById(wid)
    .then((work) => {
      if (!work) res.send({ error: "No work available" });

      work.workstatus[0].workCompleted = true;
      work.save().then((w) => {
        res.send(w);
      });
    })
    .catch(() => {});
};
