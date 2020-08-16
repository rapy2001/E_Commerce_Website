const mongoose = require("mongoose");

const gadgetSchema = new mongoose.Schema({
    gadgetName:{
        type:String,
        trim:true,
        unique:true
    },
    imageUrl:{
        type:String
    },
    description:{
        type:String
    },
    Type:{
        type:Number
    },
    price:{
        type:Number
    },
    amount:{
        type:Number
    },
    reviews:[
        {
            type:mongoose.Schema.Types.ObjectId
        }
    ]
});

module.exports = mongoose.model("Gadget",gadgetSchema);