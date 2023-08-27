const cart = require('../model/cartmodel')
const User = require('../model/usermodel')
const product = require('../model/productmodel')
const useraddress =require('../model/addressmodel')
const { Schema } = require('mongoose')
const { json } = require('body-parser')
const coupon = require('../model/coupon')

const verifycoupon  = async(couponcode,userid,total)=>{
    try{
        const coupons= await coupon.findOne({couponcode:couponcode})
        if(coupons){
            if(coupons.usedBy-new Date()<0){
                return ({status:false,message:"Coupon Expired"})
            }else if(coupons.minimumAmount>total){
                return ({status:false,message:`Coupn can't be used on this order minimum purchase should be ${coupons.minimumAmount}`})
                }

                const couponused = await User.findOne({
                    _id: userid,
                    coupon: { $elemMatch: { $eq: couponcode } },
                  });
                if(couponused){
                    return {status:false,message:"Coupon is not valid it is already used"}
                }else{
                    
                    return{status:true,message:"Coupon added successully"}
                }
        }else{
            return ({status:true,message:"invalid Coupon"})
        }

    }catch(error){
        return error
        console.log(error)
    }
}

module.exports = {verifycoupon}