const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  teamName: String,
  teamId: String,
  leaderName: String,
  password: String,
  response: [
    {
      answer: Number,
      time: String,
    },
  ],
  startQuestion: Number,
});

const User = mongoose.model("User", UserSchema);
module.exports = User;
