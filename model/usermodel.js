const mongoose = require('mongoose')
// const { boolean } = require('webidl-conversions')

const userschema = mongoose.Schema({
    name:{
        type:String,
        
    },
    email:{
        type:String,
       
    },
    mobile:{
        type:String,
       
    },
    coupon:{
        type:Array
    },
    password:{
        type:String,
       
    },
    refferalcode:{
        type:String
    },
    wallet:{
        type:Number,
        default:0
    },
    walletTransactions:[{
        message:{
            type:String,
        },
        createdAt:{
            type:Date,
            default:Date.now()
        },
        amount:{
            type:Number
        }
    }],
    // cpassword:{
    //     type:String,
    //     required:true
    // },
    // is_verified:{
    //     type:Number,
    //     required:true
    // },
    is_admin:{
        type:Number,
        required:true
    },
    is_blocked:{
        type:Number,
        required:true,
        
    }
})

module.exports= mongoose.model('user',userschema)