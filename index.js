// Main starting point of the application
const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const app = express();
const router = require("./router");
const mongoose = require("mongoose");
const axios = require("axios");
// const cors = require('cors');  // we don't need it anymore, because we use proxy server instead

// DB Setup (connect mongoose and instance of mongodb)
mongoose.connect(
  process.env.MONGO_DB_URL ||
    "mongodb+srv://funnyguys:funnyguys@cluster0.dk88w.mongodb.net/inout?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  }
);
const cors = require("cors");
app.use(cors());
// App Setup (morgan and body-parser are middleware in Express)
app.use(morgan("combined")); // middleware for logging
//app.use(bodyParser.json({ type: "*/*" })); // middleware for helping parse incoming HTTP requests
app.use(cors()); // middleware for circumventing cors error
app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: false }));
app.use("/assets", express.static("assets"));

// Router Setup
router(app);

// Server Setup
const port = process.env.PORT || 5000;
//const server = http.createServer(app);
//server.listen(port);
console.log("Server listening on: ", port);

// axios
//   .get(`https://randomuser.me/api`)
//   .then((response) => {
//     console.log(response.data.results);
//   })
//   .catch(({ response }) => {});

/**  Sockets routines **/

const io = require("socket.io")(app.listen(process.env.PORT || 5000));
var users = {};
io.on("connection", function (socket) {
  console.log("connection is successful" + " " + socket.id);

  socket.on("init", (payload) => {
    users[payload.uid] = socket;
  });
  socket.on("agenttake", (payload) => {
    //console.log(at.work);
    //socket.emit("refresh", { work: payload.work });
    users[payload.work.userId].emit("refresh", { work: payload.work }); //cust
    users[payload.agentid].emit("refresh", { work: payload.work }); //agent
  });
  socket.on("custacceptjob", (payload) => {
    //loop .. all 10 agents in payload.agentId or socket-rooms
    users[payload.fagentid].emit("refresh", { work: payload.work }); //agent
    users[payload.work.userId].emit("refresh", { work: payload.work }); //cust
  });
  socket.on("custrejectjob", (payload) => {
    //users[payload.fagentid].emit("refresh", { work: payload.work });
    users[payload.work.finalagentId].emit("refresh", { work: payload.work }); //agent
    users[payload.work.userId].emit("refresh", { work: payload.work }); //cust
  });
  socket.on("agentrejectjob", (payload) => {
    users[payload.work.userId].emit("refresh", { work: payload.work }); //cust
    users[payload.work.finalagentId].emit("refresh", { work: payload.work }); //agent
  });
  socket.on("completedjob", (payload) => {
    users[payload.work.finalagentId].emit("refresh", { work: payload.work }); //agent //payload.fagentid
    users[payload.work.userId].emit("refresh", { work: payload.work }); //cust
  });
});
