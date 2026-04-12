const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../cloudConfig");

//  STORAGE
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "resume_uploads",
    resource_type: "raw", //  For PDF
  },
});

//  FILE FILTER (PDF ONLY)
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed"), false);
  }
};

// SIZE LIMIT (2MB)
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
});

module.exports = upload;
