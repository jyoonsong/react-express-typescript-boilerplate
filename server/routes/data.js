/*
|--------------------------------------------------------------------------
| log.js -- server routes relevant to logs
|--------------------------------------------------------------------------
|
*/

const express = require("express");

// import authentication library
const data_controller = require("../controllers/data");

// api endpoints: all these paths will be prefixed with "/api/"
const router = express.Router();

router.get("/reset_ratings/", data_controller.resetRatings);
router.get("/reset_finished_stories/", data_controller.resetFinishedStories);

module.exports = router;
