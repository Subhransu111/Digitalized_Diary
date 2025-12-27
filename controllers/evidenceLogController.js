const EvidenceLog = require('../models/Evidence_log');
const QrCode = require('qrcode');

// 1. NEW BUFFER VALIDATION (Works on Vercel)
const validateFileSignature = (buffer) => {
    return new Promise((resolve) => {
        if (!buffer || buffer.length < 8) return resolve(false);

        // Get the first 8 bytes of the file in Hex
        const header = buffer.toString('hex', 0, 8).toUpperCase();
        
        console.log('Detected File Header:', header); // Debugging

        // Check signatures
        const isPng = header.startsWith('89504E47');
        const isPdf = header.startsWith('25504446');
        const isJpeg = header.startsWith('FFD8');

        if (isPng || isPdf || isJpeg) {
            resolve(true);
        } else {
            resolve(false);
        }
    });
}

// 2. UPDATED VALIDATE ROUTE
async function validateEvidenceUpload(req, res){
    try{
        if (!req.file) return res.status(200).json({success:true});

        console.log(`Checking file: ${req.file.originalname}`);

        // FIX: Pass the BUFFER, not the path
        const isSafe = await validateFileSignature(req.file.buffer);
        
        if (!isSafe){
            return res.status(400).json({
                success:false,
                message:"Security Alert: File Signature Rejected"
            });
        }
        return res.status(200).json({
            success:true , message:"Safe File"
        });

    } catch(error){
        console.error("Validation Error:", error);
        res.status(500).json({success:false , error:error.message});
    }
};

// 3. UPDATED CREATE CONTROLLER
async function createEvidenceLog(req, res) {
    try {
        const { caseId, caseTitle, description, evidenceType, loggedBy } = req.body;

        // A. Validate Signature (Using Buffer)
        if (req.file) {
            const isSafe = await validateFileSignature(req.file.buffer);
            if (!isSafe) {
                return res.status(400).json({
                    success: false,
                    message: "Security Alert: File type not allowed.",
                });
            }
        }

        // B. Validate Fields
        if (!caseId || !evidenceType) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields",
            });
        };

        // C. Generate QR
        const officerName = loggedBy || "System"; 
        const qrData = JSON.stringify({
            caseId, caseTitle, description, evidenceType, loggedBy: officerName,
            timeStamp: new Date().toISOString(),
        });
        const qrCodeImage = await QrCode.toDataURL(qrData);

        // D. Create DB Entry
        // Note: For Vercel, we can't save the file to disk locally. 
        // Ideally, you upload this buffer to AWS S3 or Cloudinary here.
        // For now, we will save a "placeholder" path or base64 if small.
        
        const newEvidenceLog = await EvidenceLog.create({
            caseId, caseTitle, description, evidenceType,
            loggedBy: officerName,
            documentPath: "Stored_in_Cloud_Bucket", // Placeholder since we can't store on Vercel disk
            qrCode: qrCodeImage,
        });

        return res.status(201).json({
            success: true,
            data: newEvidenceLog,
        });

    } catch (error) {
        console.error("Create Evidence Error:", error);
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