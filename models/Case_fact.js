const mongoose=require('mongoose');
const caseFactSchema=new mongoose.Schema({
    caseId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Case',
        required:true,
    },
    factType:{
        type:String,
        required:true,
    },
    factDescription:{
        type:String,
        required:true,
    },
    reportedBy:{
        type:String,
    },
}, {timestamps:true});

module.exports=mongoose.model('CaseFact', caseFactSchema);