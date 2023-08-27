const { Reject } = require('twilio/lib/twiml/VoiceResponse');
const useraddress = require ('../model/addressmodel')
const Razorpay = require('razorpay');
const User = require('../model/usermodel')
var instance = new Razorpay({
  key_id: 'rzp_test_4xF26d6MOEX0v9',
  key_secret: 'ner9KLpR847zwZvTZ9p1GLXD',
});

const updateaddress =async (userid,newaddress)=>{
    try{
        // console.log(userid+newaddress);
        const updateuser =await useraddress.findOneAndUpdate({
            user :userid
           
        },
        {$push:{ addresses:newaddress}})
    } catch(error){
        console.log(error);
    return error

    }
}  

const generaterazorpaywallet = async(user,amount)=>{
    try{

        var options = {
            amount: parseInt(amount *100), // amount in the smallest currency unit
      currency: "INR",
      receipt: user.toString(),
        }
        return new Promise((resolve,reject)=>{
            instance.orders.create(options,function(err,order){
                if(err){
                //   console.log("koop3");
                  reject(err)
                }else{
                //   console.log("koop2");
                  resolve(order)
                }
               
              })  
        })
    }catch(error){
    return error
        
        console.log(error);
       
    }
}
const crypto = require("crypto");
const verifypayment  = async (detials)=>{
    try{
        let hmac  =crypto.createHmac("sha256",'ner9KLpR847zwZvTZ9p1GLXD')
        const orderid  = detials.razorpay_order_id
        const paymentid = detials.razorpay_payment_id
        const signature = detials.razorpay_signature
        hmac.update(orderid+"|"+paymentid)
        hmac  = hmac.digest("hex")
        if(hmac==signature){
            return
        }
    }catch(error){
        return error
        // console.log(error);
    }
}

module.exports = {updateaddress,generaterazorpaywallet,verifypayment}