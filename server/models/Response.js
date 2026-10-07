import mongoose from "mongoose";

const answerSchema = new mongoose.Schema(
  {
    questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
    value: { type: mongoose.Schema.Types.Mixed }
  },
  { _id: false }
);

const responseSchema = new mongoose.Schema(
  {
    form: { type: mongoose.Schema.Types.ObjectId, ref: "Form", required: true },
    respondent: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    answers: [answerSchema]
  },
  { timestamps: true }
);

export default mongoose.model("Response", responseSchema);
