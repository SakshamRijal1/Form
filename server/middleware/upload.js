import multer from "multer";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const uploadDirectory = path.join(process.cwd(), "uploads");

fs.mkdirSync(uploadDirectory, {
  recursive: true,
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);

    const filename =
      crypto.randomBytes(16).toString("hex") +
      "-" +
      Date.now() +
      extension;

    cb(null, filename);
  },
});

const allowedFiles = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/avif",

  "application/pdf",

  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",

  "text/plain",
  "text/csv",
];

function responseFileFilter(req, file, cb) {
  if (!allowedFiles.includes(file.mimetype)) {
    return cb(
      new Error(
        "Unsupported file type. Please upload an image, PDF, Word, Excel, PowerPoint, TXT or CSV file."
      )
    );
  }

  cb(null, true);
}

function imageFileFilter(req, file, cb) {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image files are allowed."));
  }

  cb(null, true);
}

const uploadOptions = {
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },
};

export const responseUpload = multer({
  ...uploadOptions,
  fileFilter: responseFileFilter,
});

export const imageUpload = multer({
  ...uploadOptions,
  fileFilter: imageFileFilter,
});

export function singleUpload(upload, fieldName) {
  return (req, res, next) => {
    upload.single(fieldName)(req, res, (error) => {
      if (error) {
        if (error.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            message: "File is too large. Maximum allowed size is 5 MB.",
          });
        }

        return res.status(400).json({
          message: error.message,
        });
      }

      next();
    });
  };
}