const mongoose=require("mongoose");

const userSchema=new mongoose.Schema({
    username:{
        type:String,
        trim:true,
        unique:true
    },
    password:{
        type:String
    },
    imageUrl:{
        type:String
    },
    cart:[
        {
            itemId:{
                type:mongoose.Schema.Types.ObjectId
            },
            amount:{
                type:Number
            }
        }
    ]
})

module.exports=mongoose.model("User",userSchema);