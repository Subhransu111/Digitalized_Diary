const Case = require('../models/case');

// Cretae a new Case
async function createCase(req, res) {
    try{
        const {caseNumber, caseTitle, caseDescription, caseStatus,createdBy} = req.body;
        if (!caseNumber || !caseTitle) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields",
            });
            }
        const newCase = await Case.create({
            caseNumber,
            caseTitle,
            caseDescription,
            caseStatus,
            createdBy,
        });
        return res.status(201).json({
            success: true,
            message: "Case created successfully",
            data: newCase,
        });

    }
    catch (error){
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    };
};

// Get all Cases

async function getCases(req,res) {
    try{
    const cases = await Case.find({});
    return res.status(200).json({
        success: true,
        data: cases,
    });
    }
    catch (error){
    return res.status(500).json({
        success: false,
        error: error.message,
    });

    }
};

module.exports = {
    createCase,
    getCases,
};