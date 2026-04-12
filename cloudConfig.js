const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

// config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "resume_uploads",

    resource_type: "raw", //

    allowed_formats: ["pdf"],
  },
});

module.exports = cloudinary; //
