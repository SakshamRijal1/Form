import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    type: {
      type: String,
      enum: [
        "short_answer",
        "long_answer",
        "email",
        "number",
        "multiple_choice",
        "checkboxes",
        "dropdown",
        "date",
        "rating"
      ],
      default: "short_answer"
    },
    options: [{ type: String }],
    required: { type: Boolean, default: false }
  },
  { _id: true }
);

const sectionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    questions: [questionSchema]
  },
  { _id: true }
);

const formSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    sections: [sectionSchema],
    published: { type: Boolean, default: false },
    shareId: { type: String, unique: true, sparse: true }
  },
  { timestamps: true }
);

export default mongoose.model("Form", formSchema);
