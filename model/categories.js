const mongoose = require('mongoose')
const categoriesschema = mongoose.Schema({
    name:{
        type:String,
        requiured:true
    },
    description:{
        type:String,
        // required:true
    }
})


module.exports = mongoose.model('categories',categoriesschema)