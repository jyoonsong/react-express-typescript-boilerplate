const mongoose = require("mongoose");
const { Schema } = mongoose;

const LogSchema = new Schema({
    category: { // maintain or change
        type: String, 
        default: "maintain",
    },
    content: String, // score to change to 
    metadata: String, // reason
    user_id: String,
    story_id: {
        type: Schema.ObjectId,
        ref: "story",
    },
}, { timestamps: true });

// compile model from schema
module.exports = mongoose.model("log", LogSchema);