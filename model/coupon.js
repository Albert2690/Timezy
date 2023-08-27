const mongoose = require ('mongoose')


const couponSchema =   mongoose.Schema({
 
    couponcode:{
        type:String
    },
    usedBy:{
        type:Date
    },
    minimumAmount:{
        type:Number
    },
    maximumDiscount:{
        type:Number
    },
    discountPercentage:{
        type:Number
    },
    createdAt:{
        type:Date
    }

})

module.exports = mongoose.model('coupon',couponSchema)