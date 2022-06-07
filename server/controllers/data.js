const ratings = require("../ratings");
const Story = require("../models/Story");
const User = require("../models/User");
const Log = require("../models/Log");

const resetFinishedStories = async (req, res) => {
    try {
        if (!req.session.user?.admin) {
            return res.status(401).send({ error: "Unauthorized" }); 
        }
        // reset finished stories
        const users = await User.where({
            active: true,
        });
        users.forEach(async (user, i) => {
            user.finished_stories = [];
            await user.save();
        });

        // create a new log that I reset the data
        const newLog = new Log({
            category: "reset_finished_stories",
            content: "reset_finished_stories",
            metadata: "reset_finished_stories",
            user_id: req.session.user.id,
        });
        await newLog.save();

        return res.status(200).send({ success: true });
    } catch (err) {
        console.log(`Failed to create a log: ${err}`);
        return res.status(401).send({ err });
    }
}

const resetRatings = async (req, res) => {
    try {
        if (!req.session.user?.admin) {
            return res.status(401).send({ error: "Unauthorized" }); 
        }

        // reset ratings
        ratings.forEach(async (ratingArr, i) => {
            const story = await Story.findOne({ story_index: i });
            story.ratings = ratingArr;
            await story.save();
        });

        // create a new log that I reset the data
        const newLog = new Log({
            category: "reset_ratings",
            content: "reset_ratings",
            metadata: "reset_ratings",
            user_id: req.session.user.id,
        });
        await newLog.save();

        return res.status(200).send({ success: true });
    } catch (err) {
        console.log(`Failed to create a log: ${err}`);
        return res.status(401).send({ err });
    }
}

module.exports = {
    resetRatings,
    resetFinishedStories,
}
