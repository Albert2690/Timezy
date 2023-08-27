const mongoose = require('mongoose')

const cartschema = new mongoose.Schema({
    user:{
       type:  mongoose.Schema.Types.String,
       ref:'user'
    },
    cartitems:[
        {
            product: {type:mongoose
            .Schema.Types.String,ref:'products'},
            name:{type:String},
            quantity:{type:Number,default:1},
            total:{type:Number}
           
        }
    ],
    subtotal:{
        type:Number,
        def:0
    }  
       
   
})
module.exports = mongoose.model('cart',cartschema)
