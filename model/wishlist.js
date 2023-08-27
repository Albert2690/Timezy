const mongoose = require('mongoose')


const wishlistSchema  =   mongoose.Schema({
    user:{ 
    type: mongoose.Schema.Types.ObjectId,
    ref:"user",
    },
    

    items:[{
        product:{
            type:    mongoose.Schema.Types.ObjectId,
               ref:"products"
           },
    }],
    createdAt:{
        type:Date,
        default:Date.now
    }

})
module.exports = mongoose.model("wishlist",wishlistSchema)