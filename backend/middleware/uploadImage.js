import multer from "multer";

const storage = multer.memoryStorage();

const imageOnlyFilter = (req, file, cb) => {
  if (file.mimetype && file.mimetype.startsWith("image/")) {
    cb(null, true);
    return;
  }
  cb(new Error("Only image files are allowed"), false);
};

const uploadImage = multer({
  storage,
  fileFilter: imageOnlyFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

export default uploadImage;
