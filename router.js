const Authentication = require("./controllers/authentication");
const Profile = require("./controllers/userinfo");
const Work = require("./controllers/work");
const Services = require("./controllers/services");
// service
const passport = require("passport");
const passportService = require("./services/passport");

// middleware in between Incoming Request and Route Handler
const requireAuth = passport.authenticate("jwt", { session: false });
const requireSignin = passport.authenticate("local", { session: false });

module.exports = function (app) {
  /**
   * Authentication APIs
   */

  app.get("/api/", requireAuth, function (req, res) {
    res.send({ message: "Super secret code is ABC123" });
  });

  app.post("/api/signup", Authentication.signup);

  app.post("/api/signin", requireSignin, Authentication.signin);
  // app.post('/api/signin', Authentication.signin);

  app.get("/api/verify_jwt", requireAuth, Authentication.verifyJwt);

  /**
   * Profile APIs
   */

  app.get("/api/profile", requireAuth, Profile.fetchProfile);

  app.put("/api/profile", requireAuth, Profile.updateProfile);

  app.put("/api/password", requireAuth, Profile.resetPassword);

  /*Services */
  app.get("/api/services", Services.fetchServices);


  /*
  Work Routes
  */
  app.post("/api/work", requireAuth, Work.postWork);
  app.get("/api/work", requireAuth, Work.fetchWorks);
};

// CRUD:
// - Create: http post request
// - Read: http get request
// - Update: http put request
// - Delete: http delete request
