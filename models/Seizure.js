const mongoose = require('mongoose');
const seizureSchema = new mongoose.Schema({
    caseId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Case',
        required:true,
    },
    itemDescription:{
        type:String,
        required:true,
    },
    quantity:{
        type:Number,
        required:true,
    },
    locationSeized:{
        type:String,
        required:true,
    },
    seizedBy:{
        type:String,
    },
}, {timestamps:true});

module.exports = mongoose.model('Seizure', seizureSchema);