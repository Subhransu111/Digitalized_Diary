const EvidenceLog = require('../models/Evidence_log');
const QrCode = require('qrcode');
const fs = require('fs');

//Validate the content of the file
const validateFileSignature = (filePath)=>{
    return new Promise((resolve, reject)=>{
        const stream = fs.createReadStream(filePath,{start:0 , end: 7});
        let bytes =[]
        stream.on('data', (chunk)=>{
            bytes.push(...chunk);
        });
        stream.on('end',()=>{
            const header = bytes.map(b=>b.toString(16).toUpperCase().padStart(2,'0')).join(' ');
            const isPng = header.startsWith('89504E47');
            const isPdf = header.startsWith('25504446');
            const isJpeg = header.startsWith('FFD8FF');

            if(isPng || isPdf || isJpeg){
                resolve(true);
            }
            else{
                resolve(false);
            }
        });
        stream.on('error',(err)=>{
            reject(err);
        }
        );
    })
}

// Create a new Evidence Log
async function createEvidenceLog(req,res){
    try{
        const {caseId , description, evidenceType} = req.body;

        // Validate file signature if file is uploaded
        if (req.file){
            const isSafe = await validateFileSignature(req.file.path);
            if(!isSafe){
                fs.unlinkSync(req.file.path);
                return res.status(400).json({
                    success:false,
                    message:"Security Alert: Uploaded file type is not allowed.",
                });
            }
        }

        // Validate required fields
        if(!caseId || !description || !evidenceType){
            return res.status(400).json({
                success: false,
                message: "caseId, description and evidenceType are required",
            });
        };

        const filePath = req.file ? req.file.path : null;

        //Generate QR Code for the evidence log
        const qrData = JSON.stringify({
            caseId: caseId,
            description: description,
            evidenceType: evidenceType,
            loggedBy: req.auth.payload.sub,
            timeStamp: new Date().toISOString(),
        })

        //Generate QR code image and save to file system
        const qrCodeImage = await QrCode.toDataURL(qrData);

        const newEvidenceLog = await EvidenceLog.create({
            caseId,
            description,
            evidenceType,
            loggedBy, //req.user.sub // Auth0 user
            documentPath: filePath,
            qrCode : qrCodeImage,
        });
        return res.status(201).json({
            success: true,
            message: "Evidence log created successfully",
            data: newEvidenceLog,
        }) ;
    }
    catch(error){
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        return res.status(500).json({
            success:false,
            error:error.message,
        });
    };
};

// Get all Evidence Logs by case ID
async function getEvidenceLogsByCase(req, res) {
    try{
        const evidenceLogs = await EvidenceLog
        .find({
            caseId: req.params.caseId
            })
        .sort({ createdAt: 1})
        return res.status(200).json({
            success:true,
            message:"Evidence logs have been retrieved",
            data:evidenceLogs,
        });
    }
    catch(error){
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

module.exports = {
    createEvidenceLog,
    getEvidenceLogsByCase,
};  