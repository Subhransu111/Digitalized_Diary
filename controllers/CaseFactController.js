const CaseFact = require('../models/Case_fact');

// Create a new Case Fact
async function createCaseFact(req,res){
    try{
        const {caseId , factType, factDescription,reportedBy} = req.body;

        if(!caseId || !factType ){
            return res.status(400).json({
                success: false,
                message: "caseId and factType are required",
            
            });
        }
        const newFact = await CaseFact.create({
            caseId,
            factType,
            factDescription,
            reportedBy, //req.user.sub // Auth0 user
        });
        return res.status(201).json({
            success: true,
            message: "Case fact created successfully",
            data: newFact,
        })

    }
    catch(error){
        return res.status(500).json({
            success:false,
            error:error.message,
        });
    }
};

// Get all facts by case ID

async function getFactsByCase(req, res) {
    try{
        const facts = await CaseFact
        .find({
            caseId: req.params.caseId
            })
        .sort({ createdAt: 1})

        return res.status(200).json({
            success:true,
            message:"Case fact has been retrieved",
            data:facts,
        });

    }
    catch(error){
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

module.exports={
    createCaseFact,
    getFactsByCase
}