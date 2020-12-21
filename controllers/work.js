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

exports.fetchWorksDonebyUid = async function (req, res, next) {
  const allmyworksdone = await Work.find({ finalagentId: req.params.id });

  if (!allmyworksdone) res.send({ error: "No works available" });

  res.send(allmyworksdone);
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
      //console.log(work);
      work.status[0].agentRequested = true;
      //work.agentId = agentid;
      work.currentstatus = "agentrequested";
      const exists = (agent_id) => agent_id == agentid;

      if (!work.agentId.some(exists)) {
        if (work.agentId.length <= 10) {
          work.agentId.push(agentid);
        } else {
          res.send({
            msg:
              "Try some other works pool already full or try sometimes later may be if pool is free if any agent withdraws",
          });
        }
      }
      //console.log(work);
      work.save().then((w) => {
        //console.log(w);
        User.findById(agentid).then((agent) => {
          agent.isWorking = true;
          agent.currentWorking = w._id;
          agent.save();
          res.send(w);
        });
      });
    })
    .catch(() => {});
};

exports.agentwithdraw = async function (req, res, next) {
  const { agentid, wid } = req.body;
  Work.findById(wid).then((work) => {
    const index = work.agentId.indexOf(agentid);
    if (index > -1) {
      work.agentId.splice(index, 1);
      work.status[0].agentCancelled = true;
      work.workstatus[0].workCancelled = true;
      work.currentstatus = "agentcancelled";
    }
    res.send(work);
  });
};

exports.custaccepted = async function (req, res, next) {
  const { custid, wid, fagentid } = req.body;

  Work.findById(wid)
    .then((work) => {
      if (!work) res.send({ error: "No work available" });

      work.status[0].customerAccepted = true;
      work.currentstatus = "custaccepted";
      work.workstatus[0].workOngoing = true;
      work.currentworkstatus = "ongoing";

      work.finalagentId = fagentid;
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

      // work.status[0].customerAccepted = false;
      // work.status[0].agentRequested = false;
      work.status[0].customerCancelled = true;
      work.workstatus[0].workCancelled = true;
      work.currentstatus = "custcancelled";
      work.currentworkstatus = "workcancelled";
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

      work.status[0].workDone = true;
      work.workstatus[0].workCompleted = true;
      work.currentstatus = "workdone";
      work.currentworkstatus = "workdone";

      work.save().then((w) => {
        res.send(w);
      });
    })
    .catch(() => {});

  /*Rate cal logic with work feedback(sentiment,rating(0-5)) from work from profile feedbacks(sentiment,rating(0-5)), etc*/
};
