// server/middleware/uploadMiddleware.js

const multer = require('multer');
const path = require('path');

/**
 * Creates a multer middleware instance for handling single file uploads.
 * This factory approach allows for potential future customization if different
 * routes need different upload rules.
 *
 * @param {object} options - Configuration options.
 * @param {RegExp} options.allowedFileTypes - A regex of allowed mimetypes/extensions.
 * @param {number} options.maxFileSizeMB - The maximum file size in megabytes.
 * @returns {Function} A configured multer middleware instance.
 */
const createUploadMiddleware = ({ allowedFileTypes, maxFileSizeMB }) => {
  // Configure storage for uploaded files on the local disk.
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      // The destination folder for uploads.
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      // Create a unique filename to prevent overwrites: fieldname-timestamp.ext
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
  });

  // Create the multer instance with storage, limits, and file filter.
  const upload = multer({
    storage: storage,
    limits: {
      // Convert megabytes to bytes for the size limit.
      fileSize: maxFileSizeMB * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
      // Test the file's mimetype and original name extension against the allowed types regex.
      const isValid = allowedFileTypes.test(file.mimetype) && allowedFileTypes.test(path.extname(file.originalname).toLowerCase());

      if (isValid) {
        // Accept the file.
        cb(null, true);
      } else {
        // Reject the file with a specific error message.
        cb(new Error(`File type not allowed. Please upload a valid file.`), false);
      }
    }
  });

  // Return middleware configured to handle a single file from a field named 'resource'.
  return upload.single('resource');
};

// --- Default Export ---
// Create a default instance for general resource uploads.
const defaultResourceUpload = createUploadMiddleware({
  allowedFileTypes: /jpeg|jpg|png|pdf|doc|docx|ppt|pptx|mp4|avi/,
  maxFileSizeMB: 25 // Set a default max size of 25MB
});

module.exports = defaultResourceUpload;