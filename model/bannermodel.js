const  mongoose = require('mongoose')

const bannerschema = mongoose.Schema({
    title:{
        type:String
    },
    image:{
        type:String
    },
    CreatedAt:{
        type:Date,
        default:Date.now()
    },
    updatedAt:{
        type:Date,
        default:Date.now()
    }
})

module.exports = mongoose.model('banner',bannerschema)