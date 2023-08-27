const mongoose = require('mongoose')

const orderSchema =  new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    items:[
        {
            product:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"products",
                required:true
            },
            quantity:{
                type:Number,
                required:true,
                min:1
            },
            price:{
                type:Number,
                required:true,
                
            }
        
}],
    total:{
        type:Number,
        required:true
    },
    status:{
        type:String,
        enum:["pending","placed","processing","shipped","delivered","cancel requested","return requested","cancelled","returned","refunded","return accepted","direct cancel","cancel declined" ,"return declined"],
        default:'pending'
    },
    createdAt:{
        type:Date,
        default:Date.now
    },

    paymentmethod:{
        type:String,
        enum:['cardpayement','razorpay','cod','paypal','wallet'],

    },
    address:{
        type:Object
    },
})
 module.exports = mongoose.model('Order',orderSchema)