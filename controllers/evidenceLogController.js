const EvidenceLog = require('../models/Evidence_log');
const QrCode = require('qrcode');
const fs = require('fs');

// 1. FIXED VALIDATION FUNCTION
const validateFileSignature = (filePath) => {
    return new Promise((resolve, reject) => {
        const stream = fs.createReadStream(filePath, { start: 0, end: 7 });
        let bytes = [];
        
        stream.on('data', (chunk) => {
            bytes.push(...chunk);
        });

        stream.on('end', () => {
            // FIX: Changed .join(' ') to .join('') to remove spaces for easier comparison
            const header = bytes.map(b => b.toString(16).toUpperCase().padStart(2, '0')).join('');
            
            console.log('Detected File Header:', header); // Debugging Log

            // Check against standard signatures (Hex)
            const isPng = header.startsWith('89504E47');
            const isPdf = header.startsWith('25504446');
            // JPEG can be FFD8FFE0, FFD8FFE1, FFD8FFDB... so we check just FFD8
            const isJpeg = header.startsWith('FFD8'); 

            if (isPng || isPdf || isJpeg) {
                resolve(true);
            } else {
                resolve(false);
            }
        });

        stream.on('error', (err) => {
            reject(err);
        });
    });
}

async function validateEvidenceUpload(req,res){
    try{
        if (!req.file) return res.status(200).json({success:true});
        console.log('checking file: ${req.file.originalname}');

        const isSafe = await validateFileSignature(req.file.path);
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        
        if (!isSafe){
            return res.status(400).json({
                success:false,
                message:"Security Alert: File Signature Rejected"
            });
        }
        return res.status(200).json({
            success:true , message:"Safe File"
        });

    }
    catch(error){
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({success:false , error:error.message});
    }
};

// 2. FIXED CONTROLLER
async function createEvidenceLog(req, res) {
    try {
        // FIX: Extract loggedBy from req.body (sent by Frontend)
        const { caseId, caseTitle, description, evidenceType, loggedBy } = req.body;

        // A. Validate file signature if file is uploaded
        if (req.file) {
            const isSafe = await validateFileSignature(req.file.path);
            
            if (!isSafe) {
                // Delete the unsafe file immediately
                fs.unlinkSync(req.file.path);
                console.log("Security Rejection: Invalid File Signature");
                return res.status(400).json({
                    success: false,
                    message: "Security Alert: Uploaded file type is not allowed (Must be PNG, JPG, or PDF).",
                });
            }
        }

        // B. Validate required fields
        if (!caseId || !caseTitle || !description || !evidenceType) {
            // Clean up file if validation fails
            if (req.file) fs.unlinkSync(req.file.path);
            
            return res.status(400).json({
                success: false,
                message: "caseId, caseTitle, description and evidenceType are required",
            });
        };

        const filePath = req.file ? req.file.path : null;

        // C. Generate QR Code
        // Use the loggedBy name sent from frontend, or fallback to 'System'
        const officerName = loggedBy || "System"; 

        const qrData = JSON.stringify({
            caseId: caseId,
            caseTitle: caseTitle,
            description: description,
            evidenceType: evidenceType,
            loggedBy: officerName,
            timeStamp: new Date().toISOString(),
        });

        const qrCodeImage = await QrCode.toDataURL(qrData);

        // D. Create Database Entry
        const newEvidenceLog = await EvidenceLog.create({
            caseId,
            caseTitle,
            description,
            evidenceType,
            loggedBy: officerName, // FIX: Now using the defined variable
            documentPath: filePath,
            qrCode: qrCodeImage,
        });

        return res.status(201).json({
            success: true,
            message: "Evidence log created successfully",
            data: newEvidenceLog,
        });

    } catch (error) {
        console.error("Create Evidence Error:", error);
        // Clean up file on error
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    };
};

async function getEvidenceLogsByCase(req, res) {
    try {
        const evidenceLogs = await EvidenceLog
            .find({ caseId: req.params.caseId })
            .sort({ createdAt: 1 });
            
        return res.status(200).json({
            success: true,
            message: "Evidence logs have been retrieved",
            data: evidenceLogs,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

module.exports = {
    createEvidenceLog,
    getEvidenceLogsByCase,
    validateEvidenceUpload
};