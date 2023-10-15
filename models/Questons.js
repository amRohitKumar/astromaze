const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const QuestionSchema = new Schema({
  answer: Number,
  imageUrl: String,
  questionNumber: Number,
});

const Question = mongoose.model("Question", QuestionSchema);
module.exports = Question;
