const voucherCode = require("voucher-code-generator");
const cart = require('../model/cartmodel')
const User = require('../model/usermodel')
const Product = require('../model/productmodel')
const useraddress =require('../model/addressmodel')
const { Schema } = require('mongoose')
const { json } = require('body-parser')
const { login } = require('./usercontroller')
const order = require('../model/ordersmodel')
const Razorpay = require('razorpay');
const coupon = require('../model/coupon')
const couponhelper = require('../helpers/couponhelper')


const loadaddcoupon  = async (req,res)=>{
    try{
        res.render('addcoupon')
    }catch(error){
        console.log(error)
        res.status(500).send("Internal Server Error")
    }
}

const generatecoupon = async (req,res)=>{
    try{
        let couponCode =  await voucherCode.generate({
            length: 6,
            count: 1,
            charset: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
            prefix: "Timezy-",
          });
          if(couponCode){
           
            res.json({status:true,couponCode})
          }
    }catch(error){
        console.log(error);
        res.status(500).json({message:"Internal Server Error"})
    }
}

const addcoupon = async (req, res) => {
    try {
        // console.log(req.body);
        const data ={
            couponCode: req.body.couponcode,
            validity: req.body.validity,
            minPurchase: req.body.minamount,
            minDiscountPercentage: req.body.discount,
            maxDiscountValue: req.body.maxdiscount,
        }; 


        const dataa = new coupon({
            couponcode:data.couponCode,
            usedBy:data.validity,
            minimumAmount:data.minPurchase,
            maximumDiscount:data.maxDiscountValue,
            discountPercentage:data.maxDiscountValue,
            createdAt:Date.now()
        })

            // console.log(data. couponCode,'1111');
        const existing = await coupon.findOne({ couponcode: data. couponCode });

        if (existing) {
            res.json({ status: false, message: "Coupon already exists" });
        } else {
            const newCoupon = await dataa.save();

            if (newCoupon) {
                res.json({ status: true, message: "Coupon added successfully" });
            } else {
                res.json({ status: false, message: "Failed to add coupon" });
            }
        }
    } catch (error) {
        console.error(error);
        res.status(500).json("Internal Server Error");
    }
};

const loadcoupnlist =async (req,res)=>{
    try{
      const coupons=  await coupon.find({})
        res.render('couponlist',{coupons})
    }catch(error){
        console.log(error);
        res.status(500).json({message:"Internal Server Error"})
    }
}
 const verifycoupon = async(req,res)=>{
    try{
        const userid = req.session.user_id
        const couponcode = req.query.coupon
        const total = req.query.total
    
        const result = await couponhelper.verifycoupon(couponcode,userid,total)

        res.send(result)

    }catch(error){
        console.log(error);
        res.status(500).json({message:"Internal Server Error"})
    }
 }
 const applycoupon =async(req,res)=>{
    try{
        
        const total = req.query.total
        const couponcode = req.query.coupon
        const coupons = await coupon.findOne({couponcode:couponcode})
       
        // console.log(coupons,'jjjfff')
        let discountAmount = (total*coupons.
            discountPercentage)/100
        if(discountAmount>coupons.maximumDiscount){
        
            discountAmount =coupons.maximumDiscount
        }
        
        let subtotal = total-discountAmount
        

        res.json({
            subtotal:subtotal,
            status:true,
            discountAmount:discountAmount,
            discount:coupons. discountPercentage,
           
            couponcode:couponcode,
            message:"Coupon Added Successully"
        })
    }catch(error){
        console.log(error);
        res.status(500).json({message:"Internal Server Error"})
    }
 }

module.exports= {loadaddcoupon,generatecoupon,addcoupon,
    loadcoupnlist,verifycoupon,applycoupon}