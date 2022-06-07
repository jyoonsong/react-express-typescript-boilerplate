const mongoose = require("mongoose");
const { Schema } = mongoose;

const { getAgreement } = require("../controllers/utils");

const StorySchema = new Schema({
  // fixed
  content: String,
  
  story_index: Number,
  master_index: Number,
  condition: Number,
  
  num_raters: Number,
  average_rating: Number,
  std_rating: Number,
  min_rating: Number,
  max_rating: Number,

  // changeable
  agreement: Number,
  ratings: [{
    rater_id: String,
    score: Number,
  }],
}, { timestamps: true });

StorySchema.pre("save", async function(next) {
  if (this.isModified("ratings")) {
    console.log("ratings modified");

    const User = require("./User");
    const users = await User.where({
      active: true,
      admin: false,
    });

    const scores = users.map(u => {
      const filtered = this.ratings.filter(r => r.rater_id === u.id);
      return filtered.length > 0 ? filtered[0].score : null;
    }).filter(s => s);

    const newAgreement = getAgreement(scores);
    this.agreement = newAgreement;
    next();
  }
  else {
    next();
  }
});

// compile model from schema
module.exports = mongoose.model("story", StorySchema);