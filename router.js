const multer = require("multer");
const crypto = require("crypto");
const formidable = require("formidable");
const fs = require("fs");
const Workschema = require("./models/work");

const Authentication = require("./controllers/authentication");
const Profile = require("./controllers/userinfo");
const Work = require("./controllers/work");
const Payment = require("./controllers/payment");
const Services = require("./controllers/services");
// service
const passport = require("passport");
const passportService = require("./services/passport");

// middleware in between Incoming Request and Route Handler
const requireAuth = passport.authenticate("jwt", { session: false });
const requireSignin = passport.authenticate("local", { session: false });

const storage = multer.diskStorage({
  destination: (req, file, cd) => {
    cd(null, "./assets/");
  },
  filename: (req, file, cd) => {
    cd(null, crypto.randomBytes(10).toString("hex") + file.originalname);
  },
});

const uploadFile = multer({ storage });

module.exports = function (app) {
  /*
   * Authentication APIs
   */

  app.get("/api/", requireAuth, function (req, res) {
    res.send({ message: "Super secret code is ABC123" });
  });
  app.post("/api/signup", Authentication.signup);
  app.post("/api/signin", requireSignin, Authentication.signin);
  // app.post('/api/signin', Authentication.signin);
  app.get("/api/verify_jwt", requireAuth, Authentication.verifyJwt);

  /*
   * Profile APIs
   */

  app.get("/api/profile", requireAuth, Profile.fetchProfile);
  app.get("/api/profile/:id", requireAuth, Profile.fetchProfileById);
  app.put("/api/profile", requireAuth, Profile.updateProfile);

  app.put("/api/password", requireAuth, Profile.resetPassword);

  /* Services */
  app.get("/api/getservices", Services.fetchServices);

  /* Agent routes */
  app.post("/api/agent/update", Profile.updateAgent);

  /*Work Routes*/

  //app.post("/api/work", Work.postWork);
  //app.post("/api/work/photo/:postId", Work.photo);
  //uploadFile.single("file")

  app.get("/api/work", Work.fetchWorks);
  app.get("/api/workbyuid/:id", Work.fetchWorksbyUid);
  app.get("/api/workdonebyuid/:id", Work.fetchWorksDonebyUid);
  app.get("/api/work/:id", Work.fetchWorksbyid);

  app.get("/api/serviceid2service/:id", Work.serviceid2service);

  app.post("/api/work/status/agentrequested", Work.agentrequested);
  app.post("/api/work/status/custaccepted", Work.custaccepted);

  app.post("/api/work/status/custrejected", Work.custrejected);
  app.post("/api/work/status/agentrejected", Work.agentwithdraw);

  app.post("/api/work/status/workdone", Work.workdone);

  app.post("/api/work", uploadFile.single("file"), (req, res, next) => {
    const { uid, name, description, cost, serviceId, postedBy } = req.body; //files
    let status = [];
    let workstatus = [];
    let obj = {
      customerRequested: true,
      agentRequested: false,
      customerAccepted: false,
      customerCancelled: false,
      agentCancelled: false,
      workDone: false,
    };
    let obj2 = {
      workOngoing: false,
      workCancelled: false,
      workCompleted: false,
    };
    status.push(obj);
    workstatus.push(obj2);
    Workschema.create({
      userId: uid,
      name,
      description,
      cost,
      serviceId,
      photo: req.file.filename,
      status: status,
      workstatus: workstatus,
      currentstatus: "custrequested",
      currentworkstatus: "notstarted",
      completedtransaction: [],
      agentId: [],
      postedBy,
      //finalagentId: "",//object_id expected
    }).then((work) => {
      res.send(work);
    });

    // let form = new formidable.IncomingForm();
    // form.keepExtensions = true;
    // form.parse(req, async (err, fields, files) => {
    //   //console.log(fields);
    //   //console.log(files);
    //   const { uid, name, description, cost, serviceId } = fields;
    //   const photo = fs.readFileSync(files.file.path);
    //   //console.log(photo);
    //   Workschema.create({
    //     userId: uid,
    //     name,
    //     description,
    //     cost,
    //     serviceId,
    //     photo: photo,
    //   }).then((work) => {
    //     res.send(work);
    //   });
    // });
    //console.log(req.file);
  });

  /*Payment & transaction details */
  app.post("/api/payment/", Payment.payment);
  app.get("/api/payment/", Payment.trans);
};

// CRUD:
// - Create: http post request
// - Read: http get request
// - Update: http put request
// - Delete: http delete request
