if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const catchAsync = require("./utils/catchAsync");

const User = require("./models/User");
const Question = require("./models/Questons");

const DB_URL = process.env.DB_URL || "mongodb://127.0.0.1:27017/astromaze";

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cors());

mongoose
  .connect(DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((conn) => {
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  })
  .catch((err) => {
    console.log(`Error: ${err.message}`);
    process.exit(1);
  });

app.post(
  "/login",
  catchAsync(async (req, res) => {
    const { teamId, password } = req.body;
    const resp = await User.findOne({ teamId });
    if (!resp || resp.password !== password) {
      return res.status(400).send({ msg: "Wrong team id or password !" });
    }
    return res.status(200).send({
      teamId: resp._id,
      startQuestion: resp.startQuestion,
      msg: `Welcome team ${resp.teamName}`,
    });
  })
);
app.post(
  "/first",
  catchAsync(async (req, res) => {
    const { startQuestion } = req.body;
    const question = await Question.find({ questionNumber: startQuestion });
    return res.status(200).send({
      msg: "First question !",
      question: {
        imageUrl: question.imageUrl,
        questionNumber: question.questionNumber,
      },
    });
  })
);

app.post(
  "/next",
  catchAsync(async (req, res) => {
    const { answer: num, teamId } = req.body;
    const answer = parseInt(num);
    const reqUser = await User.findById(teamId);
    if (reqUser.response.length === 9) {
      if (answer === 14 || answer === 28 || answer === 31) {
        let currDate = new Date();
        reqUser.response.push({ answer, time: currDate.toString() });
        await reqUser.save();
        return res.status(200).send({
          msg: "Thanks for participating !",
          isComplete: true,
        });
      }
    }
    if (
      answer === 1 ||
      answer === 2 ||
      answer === 4 ||
      answer === 14 ||
      answer === 28 ||
      answer === 31 ||
      answer < 1 ||
      answer > 33
    ) {
      return res.status(400).send({
        msg: "Not a valid answer ! Try again.",
      });
    }
    if (!answer) {
      const firstQuestionNumber = reqUser.startQuestion;
      const firstQuestion = await Question.findOne({
        questionNumber: firstQuestionNumber,
      });
      return res.status(200).send({
        msg: "Question fetched successfully !",
        nxtQuestion: {
          imageUrl: firstQuestion.imageUrl,
          questionNumber: firstQuestion.questionNumber,
        },
      });
    }
    const numberExists = reqUser.response.some(
      (obj) => obj.answer === parseInt(answer)
    );
    if (numberExists) {
      return res.status(400).send({ msg: "Not a valid answer ! Try again." });
    }
    let currDate = new Date();
    reqUser.response.push({ answer, time: currDate.toString() });
    await reqUser.save();
    const resLen = reqUser.response.length;
    console.log(resLen, typeof(resLen));

    const nextQuestion = await Question.findOne({ questionNumber: answer });
    return res.status(200).send({
      msg: "Answer recorded successfully !",
      isComplete: (resLen >= 10),
      nxtQuestion: {
        imageUrl: nextQuestion?.imageUrl,
        questionNumber: nextQuestion?.questionNumber,
      },
    });
  })
);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`LISTENNG ON PORT ${PORT}`);
});
