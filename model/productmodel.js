const mongoose = require('mongoose')

const productschema = mongoose.Schema({
  
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"categories",
        required:true
    },
    image:{
        type:Array,
        required:true
    },
    discountpercentage:{
        type:Number
    },
    offervalidity:{
        type:Date
    },
    stock:{
        type:String
    },
    is_listed:{
        type:Number,
        required:true
    }
})
module.exports = mongoose.model('products',productschema)