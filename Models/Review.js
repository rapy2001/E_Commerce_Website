const mongoose = require("mongoose");

const reviewSchema  = new mongoose.Schema({
    reviewText:{
        type:String
    },
    rating:{
        type:Number
    },
    userDetails:{
        username:{
            type:String
        },
        userId:{
            type:mongoose.Schema.Types.ObjectId
        }
    }
});

module.exports  = mongoose.model("Review",reviewSchema);