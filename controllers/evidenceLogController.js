const EvidenceLog = require('../models/Evidence_log');
const QrCode = require('qrcode');

// 1. HELPER: Check Buffer Signature (No FS/Disk usage)
const validateFileSignature = (buffer) => {
    return new Promise((resolve) => {
        if (!buffer || buffer.length < 8) return resolve(false);

        // Get the first 8 bytes as Hex
        const header = buffer.toString('hex', 0, 8).toUpperCase();
        
        // Check Hex Signatures
        const isPng = header.startsWith('89504E47');
        const isPdf = header.startsWith('25504446');
        const isJpeg = header.startsWith('FFD8');

        if (isPng || isPdf || isJpeg) {
            resolve(true);
        } else {
            console.log("Invalid Header:", header); // Debug log
            resolve(false);
        }
    });
}

// 2. VALIDATE ROUTE
async function validateEvidenceUpload(req, res){
    try{
        // If no file, just pass
        if (!req.file) return res.status(200).json({success:true});

        // USE BUFFER, NOT PATH
        const isSafe = await validateFileSignature(req.file.buffer);
        
        if (!isSafe){
            return res.status(400).json({
                success:false,
                message:"Security Alert: File Signature Rejected"
            });
        }
        return res.status(200).json({ success:true, message:"Safe File" });

    } catch(error){
        console.error("Validation Crash:", error);
        res.status(500).json({success:false, error: error.message});
    }
};

// 3. CREATE LOG ROUTE
async function createEvidenceLog(req, res) {
    try {
        const { caseId, caseTitle, description, evidenceType, loggedBy } = req.body;

        // A. Security Check
        if (req.file) {
            const isSafe = await validateFileSignature(req.file.buffer);
            if (!isSafe) {
                return res.status(400).json({
                    success: false,
                    message: "Security Alert: File type not allowed.",
                });
            }
        }

        // B. Generate QR
        const officerName = loggedBy || "System"; 
        const qrData = JSON.stringify({
            caseId, caseTitle, description, evidenceType, loggedBy: officerName,
            timeStamp: new Date().toISOString(),
        });
        const qrCodeImage = await QrCode.toDataURL(qrData);

        // C. Create Database Entry
        // NOTE: On Vercel, we cannot save the file to disk.
        // We will just save the metadata. (To save the actual file, you need AWS S3 or Cloudinary).
        
        const newEvidenceLog = await EvidenceLog.create({
            caseId, caseTitle, description, evidenceType,
            loggedBy: officerName,
            documentPath: "File_Uploaded_to_Memory", // Placeholder
            qrCode: qrCodeImage,
        });

        return res.status(201).json({
            success: true,
            data: newEvidenceLog,
        });

    } catch (error) {
        console.error("Create Log Error:", error);
        return res.status(500).json({ success: false, error: error.message });
    };
};



// ... existing getEvidenceLogsByCase ...

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