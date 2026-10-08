import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

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
        "rating",
        "file_upload",
      ],
      default: "short_answer",
    },

    options: {
      type: [String],
      default: [],
    },

    required: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: true,
  }
);

const sectionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    questions: {
      type: [questionSchema],
      default: [],
    },
  },
  {
    _id: true,
  }
);

const formSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    template: {
      type: String,
      enum: [
        "blank",
        "contact",
        "rsvp",
        "tshirt",
        "event",
      ],
      default: "blank",
    },

    theme: {
      primaryColor: {
        type: String,
        default: "#673AB7",
      },

      backgroundColor: {
        type: String,
        default: "#F5F3FF",
      },

      headerImage: {
        type: String,
        default: "",
      },
    },

    sections: {
      type: [sectionSchema],
      default: [],
    },

    published: {
      type: Boolean,
      default: false,
    },

    shareId: {
      type: String,
      unique: true,
      sparse: true,
    },
  },

  {
    timestamps: true,
  }
);

export default mongoose.model("Form", formSchema);