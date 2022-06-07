/*
|--------------------------------------------------------------------------
| story.js -- server routes relevant to stories
|--------------------------------------------------------------------------
|
*/

const express = require("express");

// import authentication library
const story_controller = require("../controllers/story");

// api endpoints: all these paths will be prefixed with "/api/"
const router = express.Router();

router.post("/pretask", story_controller.finishPreTask);

router.post("/load/:id", story_controller.getStory);

router.get("/user", story_controller.getStoriesByUser);

router.post("/update_rating/:id", story_controller.updateRating);

router.post("/update_reasons/:id", story_controller.updateReasons);

router.get("/reasons/:id", story_controller.getReasons);

router.post("/finish/:id", story_controller.finishTask);

module.exports = router;
