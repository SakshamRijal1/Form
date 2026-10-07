import mongoose from "mongoose";

const permissionSchema = new mongoose.Schema(
  {
    form: { type: mongoose.Schema.Types.ObjectId, ref: "Form", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: {
      type: String,
      enum: ["editor", "viewer"],
      default: "viewer"
    }
  },
  { timestamps: true }
);

permissionSchema.index({ form: 1, user: 1 }, { unique: true });

export default mongoose.model("FormPermission", permissionSchema);
