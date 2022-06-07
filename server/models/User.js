const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema({
  name: String,
  order: Number,
  id: String, // playerId in the rating df Wdq6rtsgF73AFJArE
  ratedAt: String,
  active: {
    type: Boolean,
    default: false,
  },
  admin: {
    type: Boolean,
    default: false,
  },
  preTask: {
    type: Boolean,
    default: false,
  },
  finished_stories: [{
    type: Schema.ObjectId,
    ref: "story",
  }],
}, { timestamps: true });

const getNextOrder = async () => {
  // FINAL: optimize
  const users = await User.find({}).sort({ order: -1 }).limit(1);
  if (users.length > 0) {
    const max = users[0].order;
    return max + 1;
  }
  return 0;
}

UserSchema.pre('save', async function (next) {
  if (this.isNew) {
    const newOrder = await getNextOrder();
    this.order = newOrder;
    next();
  }
  else {
    next();
  }
});

// compile model from schema
const User = mongoose.model("user", UserSchema);
module.exports = User;
