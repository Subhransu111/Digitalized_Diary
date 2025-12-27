const multer = require('multer');
const path = require('path');

// Set storage engine
const storage = multer.memoryStorage();

// Filter to allow specific files
const fileFilter = (req,file,cb)=>{
    const allowTypes = /jpeg|jpg|png|pdf/;
    const mimetype = allowTypes.test(file.mimetype); // Check mime type
    const extname = allowTypes.test(path.extname(file.originalname).toLowerCase());

    if(mimetype && extname){
        return cb(null,true);
    } else{
        cb(new Error('Error: File type not supported'));
    }
};

// Initialize upload
const upload = multer({
    storage:storage,
    limits:{fileSize: 5 * 1024 * 1024}, 
    fileFilter:fileFilter
});

module.exports = upload;
