const mongoose = require('mongoose')

const reviewSchema = mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    },
    product:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'product'

    },
    review:{
        type:String
    },
    rating:{
        type:Number
    },
    createAt:{
        type:Date,
        default:Date.now()
    }
})

module.exports = mongoose.model('review',reviewSchema)