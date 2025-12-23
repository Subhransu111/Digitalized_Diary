const mongoose = require('mongoose');
const evidenceLogSchema = new mongoose.Schema({
    caseId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Case',
        required:true,
    },
    evidenceType:{
        type:String
    },
    description:{
        type:String,
    },
    loggedBy:{
        type:String,
    },
}, {timestamps:true});

module.exports = mongoose.model('EvidenceLog', evidenceLogSchema);