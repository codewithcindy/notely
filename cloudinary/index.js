const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Configure cloudinary to be connected to my account
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

// Configure Multer
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "Notely",
    allowed_formats: ["jpeg", "png", "jpg"],
  },
});

// Export our configured Cloudinary instance and our storage
module.exports = {
  cloudinary,
  storage,
};
