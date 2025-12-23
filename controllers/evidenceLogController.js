const EvidenceLog = require('../models/Evidence_log');

// Create a new Evidence Log
async function createEvidenceLog(req,res){
    try{
        const {caseId , description, evidenceType, loggedBy} = req.body;
        if(!caseId || !description || !evidenceType){
            return res.status(400).json({
                success: false,
                message: "caseId, description and evidenceType are required",
            });
        };
        const newEvidenceLog = await EvidenceLog.create({
            caseId,
            description,
            evidenceType,
            loggedBy, //req.user.sub // Auth0 user
        });
        return res.status(201).json({
            success: true,
            message: "Evidence log created successfully",
            data: newEvidenceLog,
        }) ;
    }
    catch(error){
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