const multer = require('multer');
const fs = require('fs');
const boom = require('@hapi/boom');

// Configure multer storage and file name
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const instanceId = req['params'].instanceId;
    const directoryPath = `uploads/${instanceId}/`;
    if (!fs.existsSync(directoryPath)) fs.mkdirSync(directoryPath, { recursive: true });
    cb(null, directoryPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

// Create multer upload instance
const upload = multer({ storage: storage });

// Custom file upload middleware
const uploadhandler = (req, res, next) => {
    // Use multer upload instance
    upload.array('files', 10)(req, res, (err) => {
    
        if (err) {
            console.log("error : ", err)
            return res.status(400).json({ stack: err.message, message: "Maxcount " });
        }

        // Retrieve uploaded files
        const files = req.files;
        const errors = [];

        // Validate file types and sizes
        files.forEach((file) => {
            const allowedTypes = [
                'image/jpeg', 
                'image/png', 
                'application/pdf', 
                'application/vnd.ms-excel',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            ];
            const maxSize = 5 * 1024 * 1024; // 5MB

            if (!allowedTypes.includes(file.mimetype)) {
                errors.push(`Invalid file type: ${file.originalname}`);
            }

            if (file.size > maxSize) {
                errors.push(`File too large: ${file.originalname}`);
            }
        });

        // Handle validation errors
        if (errors.length > 0) {
            // Remove uploaded files
            files.forEach((file) => {
                fs.unlinkSync(file.path);
            });
            next(boom.badRequest(errors));
        }

        // Attach files to the request object
        req.files = files;

        // Proceed to the next middleware or route handler
        next();
    });
};

module.exports = uploadhandler;