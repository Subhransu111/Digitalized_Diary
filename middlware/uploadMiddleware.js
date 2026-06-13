const fs = require('fs');
const path = require('path');
const multer = require('multer');

const uploadDir = path.join(__dirname, '../uploads/evidence');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const allowedTypes = {
    '.jpg': ['image/jpeg'],
    '.jpeg': ['image/jpeg'],
    '.png': ['image/png'],
    '.webp': ['image/webp'],
    '.pdf': ['application/pdf'],
    '.mp3': ['audio/mpeg'],
    '.wav': ['audio/wav', 'audio/x-wav', 'audio/wave', 'audio/vnd.wave'],
    '.mp4': ['video/mp4'],
    '.avi': ['video/x-msvideo', 'video/avi'],
    '.mov': ['video/quicktime'],
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const fileExt = path.extname(file.originalname).toLowerCase();
        const baseName = path.basename(file.originalname, fileExt);
        const safeName = baseName.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 80) || 'evidence';
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;

        cb(null, `${safeName}-${uniqueSuffix}${fileExt}`);
    },
});

const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const mimeList = allowedTypes[ext];

    if (mimeList?.includes(file.mimetype)) {
        return cb(null, true);
    }

    return cb(
        new Error('Security Error: Upload file type rejected. Allowed types: images, PDFs, audio, and video.'),
        false,
    );
};

const multerUpload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024,
        files: 5,
    },
    fileFilter,
});

function readHeader(filePath) {
    const fd = fs.openSync(filePath, 'r');
    try {
        const buffer = Buffer.alloc(32);
        const bytesRead = fs.readSync(fd, buffer, 0, buffer.length, 0);
        return buffer.subarray(0, bytesRead);
    } finally {
        fs.closeSync(fd);
    }
}

function isValidSignature(file) {
    const ext = path.extname(file.originalname).toLowerCase();
    const header = readHeader(file.path);
    const ascii = header.toString('ascii');
    const hex = header.toString('hex').toUpperCase();

    switch (ext) {
        case '.jpg':
        case '.jpeg':
            return hex.startsWith('FFD8FF');
        case '.png':
            return hex.startsWith('89504E470D0A1A0A');
        case '.webp':
            return ascii.startsWith('RIFF') && ascii.substring(8, 12) === 'WEBP';
        case '.pdf':
            return ascii.startsWith('%PDF');
        case '.mp3':
            return ascii.startsWith('ID3') || hex.startsWith('FFFB') || hex.startsWith('FFF3') || hex.startsWith('FFF2');
        case '.wav':
            return ascii.startsWith('RIFF') && ascii.substring(8, 12) === 'WAVE';
        case '.mp4':
        case '.mov':
            return ascii.substring(4, 8) === 'ftyp';
        case '.avi':
            return ascii.startsWith('RIFF') && ascii.substring(8, 11) === 'AVI';
        default:
            return false;
    }
}

function removeUploadedFiles(files = []) {
    files.forEach((file) => {
        if (!file?.path) return;

        const resolvedPath = path.resolve(file.path);
        const resolvedUploadDir = path.resolve(uploadDir);
        const isInsideUploadDir =
            resolvedPath === resolvedUploadDir || resolvedPath.startsWith(`${resolvedUploadDir}${path.sep}`);

        if (!isInsideUploadDir) return;

        try {
            fs.unlinkSync(resolvedPath);
        } catch (error) {
            console.error('Failed to remove rejected upload:', error.message);
        }
    });
}

const uploadEvidence = {
    array(fieldName, maxCount = 5) {
        const uploadArray = multerUpload.array(fieldName, maxCount);

        return (req, res, next) => {
            uploadArray(req, res, (error) => {
                if (error) {
                    removeUploadedFiles(req.files);
                    const statusCode = error instanceof multer.MulterError ? 400 : 400;
                    return res.status(statusCode).json({
                        success: false,
                        message: error.message,
                    });
                }

                try {
                    const invalidFile = (req.files || []).find((file) => !isValidSignature(file));
                    if (invalidFile) {
                        removeUploadedFiles(req.files);
                        return res.status(400).json({
                            success: false,
                            message: `Security Error: File signature rejected for ${invalidFile.originalname}.`,
                        });
                    }
                } catch (signatureError) {
                    removeUploadedFiles(req.files);
                    return res.status(400).json({
                        success: false,
                        message: `Security Error: Upload signature validation failed. ${signatureError.message}`,
                    });
                }

                return next();
            });
        };
    },
};

module.exports = uploadEvidence;
