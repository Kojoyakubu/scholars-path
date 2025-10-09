// server/middleware/uploadMiddleware.js

const multer = require('multer');
const path = require('path');

// Define allowed file types
const allowedFileTypes = /jpeg|jpg|png|pdf|doc|mp4|avi|docx|ppt|pptx/;

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: function(req, file, cb){
    cb(null, `resource-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10000000 }, // 10MB
  fileFilter: function(req, file, cb){
    // Check extension
    const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
    // Check mimetype
    const mimetype = allowedFileTypes.test(file.mimetype);

    if(mimetype && extname){
      return cb(null, true);
    } else {
      cb('Error: Only images, PDFs, and document files are allowed!');
    }
  }
}).single('resource'); 

module.exports = upload;