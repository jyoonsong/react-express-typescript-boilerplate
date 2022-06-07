/*
|--------------------------------------------------------------------------
| index.js -- basic server routes
|--------------------------------------------------------------------------
|
*/

const express = require("express");

// import user library
const user = require("../controllers/user");

// api endpoints: all these paths will be prefixed with "/api/"
const router = express.Router();

router.post("/login", user.login);
router.get("/whoami", (req, res) => {
  if (!req.user) {
    // not logged in
    return res.status(200).send({});
  }

  res.status(200).send(req.user);
});

module.exports = router;
