const mongoose = require ('mongoose');
const caseSchema = new mongoose.Schema({
    caseNumber:{
        type:String,
        required:true,
    },
    caseTitle:{
        type:String,
        required:true,
    },
    caseDescription:{
        type:String,
        required:true,
    },
    caseStatus:{
        type:String,
        default:"Open",
    },
    created_by:{
        type:String,
    },
    
}, {timestamps:true});

module.exports = mongoose.model('Case', caseSchema);