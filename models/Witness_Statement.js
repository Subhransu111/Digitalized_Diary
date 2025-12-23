const mongoose = require('mongoose');
const witnessStatementSchema = new mongoose.Schema({
    caseId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Case', 
        required:true,
    },
    witnessName:{   
        type:String,
        required:true,
    },
    witnessContact:{
        phone: Number,
        email: String,
        address: String,
    },
    statement:{
        type:String,
        required:true,
    },
    recordedBy:{
        type:String,
    },

}, {timestamps:true}
);
module.exports = mongoose.model('WitnessStatement', witnessStatementSchema);

