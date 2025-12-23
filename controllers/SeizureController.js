const Seizure = require('../models/Seizure');

// Create a new Seizure
async function createSeizure(req,res){
    try{
        const {caseId , itemDescription, quantity, locationSeized,seizedBy} = req.body;
        if(!caseId || !itemDescription || !quantity || !locationSeized){
            return res.status(400).json({
                success: false,
                message: "caseId, itemDescription, quantity and locationSeized are required",
            });
        };

        const newSeizure = await Seizure.create({
            caseId,
            itemDescription,
            quantity,
            locationSeized,
            seizedBy, //req.user.sub // Auth0 user
        });
        return res.status(201).json({
            success: true,
            message: "Seizure created successfully",
            data: newSeizure,
        }) ;

    }
    catch(error){
        return res.status(500).json({
            success:false,
            error:error.message,
        });

    }
};

// Get all Seizures by case ID

async function getSeizuresByCase(req, res) {
    try{
        const seizures = await Seizure
        .find({
            caseId: req.params.caseId
            })
        .sort({ createdAt: 1})
        return res.status(200).json({
            success:true,
            message:"Seizures have been retrieved",     
            data:seizures,
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
    createSeizure,
    getSeizuresByCase,
};