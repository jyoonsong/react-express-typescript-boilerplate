// validator runs some basic checks to make sure you've set everything up correctly
// this is a tool provided by staff, so you don't need to worry about it
const validator = require("./server/validator");
validator.checkSetup();

// import core libraries
const http = require("http");
const express = require("express");
const session = require("express-session"); // library that stores info about each connected user
const mongoose = require("mongoose"); // library to connect to MongoDB
const path = require("path");

// other libraries
const cors = require('cors');
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
require("dotenv").config();

// routes and controllers
const indexRouter = require("./server/routes");
const auth = require("./server/controllers/user");

/*
* DB
*/
const mongoConnectionURL = process.env.MONGO_URL;
const databaseName = process.env.DB_NAME;
mongoose
  .connect(mongoConnectionURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: databaseName,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log(`Error connecting to MongoDB: ${err}`));


/*
* create a new express server
*/
const app = express();
app.use(validator.checkRoutes);

// allow us to process POST requests
app.use(express.json());

// set up a session, which will persist login data across requests
app.use(
  session({
    secret: "session-secret",
    resave: false,
    saveUninitialized: false,
  })
);

// this checks if the user is logged in, and populates "req.user"
app.use(auth.populateCurrentUser);

// connect user-defined routes
app.use("/api", indexRouter);

/*
* use
*/

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cors())
app.use(cookieParser());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

// routing
// const indexRouter = require("./routes");
// const authRouter = require("./routes/auth");
// app.use('/api', indexRouter)
// app.use('/api', authRouter)

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/client/build/index.html'));
});

// any server errors cause this function to run
app.use((err, req, res, next) => {
  const status = err.status || 500;
  if (status === 500) {
    // 500 means Internal Server Error
    console.log("The server errored when processing a request!");
    console.log(err);
  }

  res.status(status);
  res.send({
    status: status,
    message: err.message,
  });
});


/*
* run server and connect with webSocket
*/
const port = process.env.PORT || 5000;
const server = http.Server(app);

server.listen(port, () => {
  console.log(`Listening on port ${port}`)
});
// webSocket(server, app);