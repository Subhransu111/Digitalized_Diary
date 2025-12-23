const witness = require('../models/Witness_Statement');

// Create a new Witness Statement
async function createwitnessStatement (req,res){
    try{
        const {caseId , witnessName,witnessContact, statement, recordedBy} = req.body;

        if(!caseId || !witnessName || !statement){
            return res.status(400).json({
                success: false,
                message: "caseId, witnessName and statement are required",
            });
    }
        const newWitnessStatement = await witness.create({
            caseId,
            witnessName,
            witnessContact,
            statement,
            recordedBy, //req.user.sub // Auth0 user
        });
        return res.status(201).json({
            success: true,
            message: "Witness statement created successfully",
            data: newWitnessStatement,
        })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            error:error.message,
        });
    }
};

// Get all Witness Statements by case ID

async function getWitnessByCase(req, res) {
    try{
        const witnessStatements = await witness
        .find({
            caseId: req.params.caseId
            })
        .sort({ createdAt: 1})
        
        return res.status(200).json({
            success:true,
            message:"Witness statements have been retrieved",
            data:witnessStatements,
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
    createwitnessStatement,
    getWitnessByCase,
};