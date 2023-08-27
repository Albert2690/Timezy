const mongoose  =require('mongoose')

const useraddressSchema = mongoose.Schema({
    user:{
      type: mongoose.Schema.Types.ObjectId,
        ref:'user',
        
    },
    addresses:[
       { name:{
            type:String,
            
        },
         mobile:{
            type:Number,
            
         },
         pincode:{
            type:Number,
            
         },
         address:{
            type:String,
            
         },
         town:{
            type :String ,
            required : true
         },
         state:{
            type:String ,
            
         }

}]
})

module.exports= mongoose.model("useraddress",useraddressSchema)