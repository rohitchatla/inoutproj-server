// Main starting point of the application
const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const app = express();
const router = require("./router");
const mongoose = require("mongoose");
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
app.use(bodyParser.json({ type: "*/*" })); // middleware for helping parse incoming HTTP requests
// app.use(cors());  // middleware for circumventing cors error

// Router Setup
router(app);

// Server Setup
const port = process.env.PORT || 5000;
const server = http.createServer(app);
server.listen(port);
console.log("Server listening on: ", port);
