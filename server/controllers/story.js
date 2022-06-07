const Story = require("../models/Story");
const Log = require("../models/Log");
const User = require("../models/User");

const { cluster } = require("./utils");

// get a story 
const getStory = async (req, res) => {
    try {
        const story = await Story.findById(req.params.id);
        const result = processStory(story);

        if (result !== null) {
            // return story
            return res.status(200).send(result);
        }
        else {
            return res.status(401).send({ err: "This task is no longer available" });
        }
    } catch (err) {
        console.log(`Failed to get a story: ${err}`);
        return res.status(401).send({ err });
    }
}

const processStory = async (story, currentUser, ratedStories) => {
    // IMPORTANT: agreement threshold
    // console.log(story.agreement);
    if (story.agreement > 0.5) {
        return null;
    }

    // number of rounds: count the logs
    const logs = await Log.where({
        user_id: currentUser._id, 
        story_id: story._id,
    });
    
    if (logs.length >= 5) {
        return null;
    }

    // cluster (majority/minority)
    const users = await User.where({
        active: true,
    });
    const scores = users.map(u => {
        const filtered = story.ratings.filter(r => r.rater_id === u.id);
        return filtered.length > 0 ? filtered[0].score : 3;
    });
    
    const userRating = story.ratings.filter(r => r.rater_id === currentUser.id);

    const userScore = userRating.length > 0 ? userRating[0].score : -1;
    const majority = scores.length > 0 ? cluster(scores) : [];
    const isOptional = majority.includes(userScore);

    // add story to array
    return {
        ...story._doc,
        myRating: userScore,
        optional: isOptional,
    };
}

const getStoriesByUser = async (req, res) => {
    try {
        const stories = await Story.find({});
        const ratedStories = req.session.user.finished_stories || [];

        let filtered = [];
        for (let story of stories) {
            const obj = await processStory(story, req.session.user);

            if (obj !== null) {
                filtered.push(obj);
            }
        }

        const results = filtered.map((s, i) => {
            return {...s, index: i}
        }).filter(story => !ratedStories.includes(story._id.toString()));

        console.log(results.length);

        res.status(200).send({stories: results});
    } catch (err) {
        console.log(`Failed to get stories: ${err}`);
        res.status(401).send({ err });
    }
}

const getReasons = async (req, res) => {
    try {
        const users = await User.where({
            // active: true,
            admin: false,
        });

        const logs = [];
        for (let user of users) {
            if (user.id !== req.session.user.id) {
                const log = await Log.find({
                    category: "update_reasons",
                    story_id: req.params.id,
                    user_id: user.id,
                }).sort({ createdAt: -1 }).limit(1);

                if (log.length > 0) {
                    logs.push(log[0]);
                }
            }
        };
        // console.log(logs);

        res.status(200).send(logs);
    } catch (err) {
        console.log(`Failed to get reasons: ${err}`);
        res.status(401).send({ err });
    }
}

const updateReasons = async (req, res) => {
    try {
        // create log
        const newLog = new Log({
            category: "update_reasons",
            content: `${req.body.score}`,
            metadata: req.body.reasons,
            user_id: req.session.user.id,
            story_id: req.params.id,
        });
        await newLog.save();

        res.status(200).send({ ...newLog._doc, success: true });
    } catch (err) {
        console.log(`Failed to update reasons: ${err}`);
        res.status(401).send({ err });
    }
}

const updateRating = async (req, res) => {
    try {
        // find the story
        const story = await Story.findById(req.params.id);

        // update ratings
        const newRatings = story.ratings.map(rating => {
            if (rating.rater_id === req.session.user.id) {
                return {
                    rater_id: rating.rater_id,
                    score: req.body.score,
                };
            }
            return rating;
        });

        story.ratings = newRatings;
        await story.save();

        // check if score belongs to majority
        const scores = newRatings.map(r => r.score);
        const majority = cluster(scores);
        const isMajority = majority.includes(req.body.score);
        console.log(isMajority);

        // create log
        const log = {
            isMajority: isMajority,
            originalScore: req.body.originalScore,
        }
        const newLog = new Log({
            category: req.body.isStepFour ? "change_rating" : "update_rating",
            content: `${req.body.score}`,
            metadata: JSON.stringify(log),
            user_id: req.session.user.id,
            story_id: req.params.id,
        });
        await newLog.save();

        res.status(200).send({ ...story._doc, success: true, isMajority: isMajority, majority: majority });
    } catch (err) {
        console.log(`Failed to update rating: ${err}`);
        res.status(401).send({ err });
    }
}

const finishTask = async (req, res) => {
    try {
        // add story index to the user's array of finished stories
        const currentUser = await User.findById(req.session.user._id);
        const finished_stories = req.session.user.finished_stories;
        currentUser.finished_stories = [
            ...finished_stories,
            req.params.id,
        ];
        await currentUser.save();
        req.session.user = currentUser;

        if (req.body.maintain) {
            const newLog = new Log({
                category: "maintain_rating",
                content: "",
                metadata: "",
                user_id: req.session.user.id,
                story_id: req.params.id,
            });
            await newLog.save();
        }

        res.status(200).send({ success: true });
    } catch (err) {
        console.log(`Failed to finish task: ${err}`);
        res.status(401).send({ err });
    }
}

const finishPreTask = async (req, res) => {
    try {
        // add story index to the user's array of finished stories
        const currentUser = await User.findById(req.session.user._id);
        currentUser.preTask = true;
        await currentUser.save();
        req.session.user = currentUser;

        // create a new log
        const newLog = new Log({
            category: "pretask",
            content: req.body.answers,
            metadata: "",
            user_id: req.session.user.id,
            story_id: req.params.id,
        });
        await newLog.save();

        res.status(200).send({ success: true });
    } catch (err) {
        console.log(`Failed to finish task: ${err}`);
        res.status(401).send({ err });
    }
}

module.exports = {
    getStory,
    getStoriesByUser,
    updateRating,
    updateReasons,
    getReasons,
    finishTask,
    finishPreTask,
};
