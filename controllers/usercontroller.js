require('dotenv').config()
const bcrypt = require('bcrypt')
const useraddress = require('../model/addressmodel')
const profilehelper = require('../helpers/profilehelper')
const product = require('../model/productmodel')
const User = require('../model/usermodel')
const { LEGAL_TLS_SOCKET_OPTIONS } = require("mongodb");
const cart = require('../model/cartmodel')
const Review = require('../model/review')
const voucherCode = require("voucher-code-generator");


const otpGenerator = require('otp-generator')
const cartmodel = require('../model/cartmodel')

const client = require('twilio')(process.env.ACCOUNTSID, process.env.AUTHTOKEN)
const securepassword = async (password) => {
    try {
        const hashpassword = await bcrypt.hash(password, 10)
        return hashpassword
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error")
    }
}
const insertuser = async (req, res) => {
    try {
        const spassword = await securepassword(req.body.password)

        let couponCode =  await voucherCode.generate({
            length: 6,
            count: 1,
            charset: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
            prefix: "Timezy-",
          });
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            mobile: req.body.mobile,
            password: spassword,
            refferalcode:couponCode.toString(),
            // cpassword:spassword,
            is_admin: 0,
            is_blocked: 0

        })
       
        const email = req.body.email
        const useremail = await User.findOne({ email: email })
        const mobile = await User.findOne({ mobile: req.body.mobile })
        if (useremail || mobile) {
            res.render('registration', { message: "user already exists" })
            return
        }
        if (!user.name) {
            res.render('registration')
            return
        } else if (!user.mobile) {
            res.render('registration')
            return
        }
        else if (!user.password) {
            res.render('registration')
            return
        }
        else if (!user.email) {
            res.render('registration')
            return
        }
        
        const refferal = await User.findOne({refferalcode:req.body.refferal})
       
        if(refferal){
            refferal.wallet+=100
            user.wallet+=50
            await refferal.save()
            const userdataa=  await user.save()
            if(userdataa){
             res.redirect('/login')
            }else{
             res.render('registration')
            }
        }else{
       const userdata=  await user.save()
       if(userdata){
        res.redirect('/login')
       }else{
        res.render('registration')
       }
        
        }

       
            
                
                // console.log("hi");
            
        
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error")
    }
}
const login = async (req, res) => {
    try {
        res.render('login')
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error")

    }
}

const register = async (req, res) => {
    try {
        res.render('registration')
    }
    catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error")

    }
}
const verifylogin = async (req, res) => {
    const email = req.body.email
    const password = req.body.password
    const userdata = await User.findOne({ email: email,is_admin:0 })
    if (!email || !password) {
        res.render('login', { message: 'sorry Dude' })
        // console.log(message);
    }
    else if (userdata) {
        
        const passwordmatch = await bcrypt.compare(password, userdata.password)
        if (passwordmatch && userdata.is_blocked === 0) {
            //here made a change so take a look when error hits
            req.session.user = userdata
            req.session.user_id = userdata.id
         
            res.redirect('/home')
        } else {
            res.render('login', { message: 'sorry' })
        }
    }
}
const otplogin = async (req, res) => {
    try {
        res.render('verifylogin')
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error")

    }
}
const sendotp = async (req, res) => {
    try {

        const mobile = req.body.mobile
        
        const user = await User.findOne({ mobile: mobile })

        if (user && user.is_blocked === 0) {
            req.session.user_id = user._id
           
            req.session.user = user
            const otp = otpGenerator.generate(6, {
                upperCase: false,
                specialChars: false,
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false
            });
            req.session.otp = otp
            await client.messages.create({
                body: `your OTP to Login Timezy is: ${otp}`,
                from: process.env.TWILIONUMBER,
                to: `+91${mobile}`
            })
            // console.log(otp);
            res.render('verifylogin')

        } else {
            res.render('verifylogin', { message: "User not Found" })
        }
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error")

    }
}
const home = async (req, res) => {
    try {
        const userid = req.session.user_id
        
        const products = await product.find({ is_listed: 0 })
        if(!userid){
            const login =0
            res.render('home',{login,product:products,cartlength:0})
        }

        const usercart = await cart.findOne({user:userid})
       
        let cartlength = usercart?.cartitems?.length||0
        console.log(cartlength,'al');
        res.render('home', { product: products,cartlength,login:1 })
        // console.log(req.session.user_id+'GTT');
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error")

    }
}
const fpassword = async (req, res) => {
    try {
        res.render('forgetpassword')
    } catch (error) {
        res.status(500).json({message:"Internal Server Error"})
        console.log(error);
        res.status(500).send("Internal Server Error")

    }
}
const postfpassword = async (req, res) => {
    try {
        const mobile = req.body.mobile

       
        let user = await User.find({ mobile: mobile })
        if (user) {
         
            let newpassword = req.body.password
            let confirmpassword = req.body.cpassword
           
            if (newpassword === confirmpassword) {

                const gpassword = await securepassword(newpassword)


                const userd = await User.findOneAndUpdate({ _id: req.session.user_id }, { $set: { password: gpassword } })
                if (userd) {
                    res.redirect('/logout')
                }

            } else {
                res.render('forgetpassword', { message: 'passwords are not matching' })
            }
        } else {
            res.render('forgetpassword', { message: 'Invalid User' })
        }
    } catch (error) {
        res.status(500).json({message:"Internal Server Error"})
        console.log(error);
    }
}
const shop = async (req, res) => {
    try {
        const userid =req.session.user_id
        const usercart = await cart.findOne({user:userid})
        let cartlength = usercart?.cartitems?.length||0
        var search = req.query.search||''
        
        
        const products = await product.find({
            is_listed:0, $or:[{name:{$regex:'.*'+search+'.*',$options:'i'}}
           
           ] })
           
        res.render('product', { product: products,cartlength })
    } catch (error) {
        res.status(500).json({message:"Internal Server Error"})
        console.log(error);
    }
}
const loadmen = async(req,res)=>{
    try{
        const userid =req.session.user_id
        const usercart = await cart.findOne({user:userid})
        let cartlength = usercart?.cartitems?.length||0

        const products = await product.find({category:'64abcdadf1f56cf65d5fe693'})
        res.render('men',{product:products,cartlength})
     
    }catch(error){
        console.log(error)
        res.status(500).send("Internal Server Error")

    }
}

const loadwomen = async(req,res)=>{
    try{
        const userid =req.session.user_id
        const usercart = await cart.findOne({user:userid})
        let cartlength = usercart?.cartitems?.length||0

        const products = await product.find({category:'64ac25a4900296367c374577'})
        
        res.render('men',{product:products,cartlength})
     
    }catch(error){
        console.log(error)
        res.status(500).send("Internal Server Error")

    }
}
const filtershop = async(req,res)=>{
    try{
        const userid =req.session.user_id
        const usercart = await cart.findOne({user:userid})
        let cartlength = usercart?.cartitems?.length||0
       let filtervalue = req.query.value
       let maxvalue = parseInt(req.query.max);
       const minvalue =parseInt(req.query.min)
       const below = parseInt(req.query.below)
       const above = parseInt(req.query.above)
        const searchQuery = req.query.search||''
       

      
       let products  =[]
       if (filtervalue === 'min'||searchQuery) {
      
      
        products = await product.find({name: { $regex: '.*' + searchQuery + '.*', $options: 'i' }}).sort({price:1})
    }
    
    if(filtervalue==='max'){
        products = await product.aggregate([   

            {$sort:
                {
                    price:-1
                }
            }
           ])
    }


    if(below){
        products = await product.aggregate([
            {$match:{price:{$lt:below}}}
        ])
    }
   
       else if (maxvalue && minvalue) {
            products = await product.aggregate([
                { $match: { price: { $lte: parseFloat(maxvalue) } } },
                { $match: { price: { $gte: parseFloat(minvalue) } } }
            ]);
        }
        if (!isNaN(above)) {
            // Apply filtering based on above value
            let filteredProducts = await product.find({ price: { $gt: above } });
        
            if (searchQuery) {
                // Apply search query within filtered products
                products = filteredProducts.filter(product => {
                    const regex = new RegExp(searchQuery, 'i');
                    return regex.test(product.name);
                });
            } else {
                // Use only filtered products
                products = filteredProducts;
            }
        }
    
    
  
    res.render('product',{product:products,cartlength})
    }catch(error){
        res.status(500).json({message:"Internal Server Error"})
    }
}
const verifyotp = async (req, res) => {
    try {
        const otp = req.session.otp
        const Otp = req.body.otp
        req.session.user_id

        if (otp === Otp && req.session.user_id) {
            res.redirect('/home')
        } else {
            res.render('verifylogin', { message: 'Invalid OTP' })
        }
    } catch (error) {
        res.status(500).json({message:"Internal Server Error"})
        console.log(error);
    }
}
const productview = async (req, res) => {
    try {
        const id = req.query.id
        const userid =req.session.user_id
        let averageRating=0
        let average=0
    

        if(id!==undefined){
        if(id.length!==userid.length){
           console.log("hloo")

           return res.render ('404')
        }
    }
       
        const usercart = await cart.findOne({user:userid})
        const userreviews = await Review.find({product:id})
        let cartlength = usercart?.cartitems?.length||0
      
        const rating = await Review.find({product:id})
        if(rating){
            await rating.forEach(item => {
             return  averageRating+=item.rating
            });
        
         average = Math.round(averageRating/rating.length)
        }

        const products = await product.findOne({ _id: id })
        const productss = await product.find({ is_listed: 0 })


        res.render('productview', { product: products, productid: id, Products: productss ,cartlength,averageRating:average,userreviews})

    } catch (error) {
        console.log(error)
        res.status(500).send("Internal Server Error")

    }
}

const userprofileload = async (req, res) => {
    try {

        const id = req.session.user_id
        
       
        const user = await User.findOne({ _id: id })
        if (user) {
            const address = await useraddress.findOne({ user: user._id })
            if (address) {
                // ,{user:user,addresses:address.addresses}
                res.render('userprofilee', { user: user,address:address })
            } else {
                res.redirect('/addaddress')
            }

        }
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error")

    }
}
const loadaddaddress = async (req, res) => {
    try {
        const id = req.session.user_id
       
        const users = await User.findOne({ _id: id })
        
        res.render('addaddress', { userdetials: users })

    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error")

    }
}
const addresses = async (req,res)=>{
    try{ const id = req.session.user_id
        
        
        const user = await User.findOne({ _id: id })
        if (user) {
            const address = await useraddress.findOne({ user: user._id })
            if (address) {
                // ,{user:user,addresses:address.addresses}
                res.render('useraddress', { user: user,address:address })
            } else {
                res.redirect('/addaddress')
            }
        
    }
}catch(error){
    console.log(error);
    res.status(500).send("Internal Server Error")

}
}
const addreview= async (req,res)=>{
    try{
        const rating = req.body.rating
        const review = req.body.review
        const userid = req.session.user_id
        const productid = req.body.productid

       
        const existed = await Review.findOne({user:userid,product:productid})
        if(existed){
            if(review==undefined){
                await Review.findOneAndUpdate({user:userid},{$set:{rating:rating}})
            }else{
           await Review.findOneAndUpdate({user:userid},{$set:{review:review,rating:rating}})
            }
           return res.redirect('/shop')
        }
        if(review==undefined){
            const newreview = new Review({
                user:userid,
                product:productid,
                rating:rating,
                createdAt:Date.now()
            })
            newreview.save()
        }else{
            const newrevieww = new Review({
                user:userid,
                product:productid,
                review:review,
                rating:rating,
                createdAt:Date.now()
            })
            newrevieww.save()
        }
       
        
       res.redirect('/shop')
    }catch(error){
        res.status(500).json({message:"Internal Server Error"})
    }
}
const addaddress = async (req, res) => {
    const id = req.session.user_id
   
    try {
        const name = req.body.name
        const mobile = req.body.mobile
        const address = req.body.address
        const town = req.body.town
        const city = req.body.city
        const pincode = req.body.pincode
        const state = req.body.state

        // console.log(name);
        // console.log(mobile);
        // console.log(address);
        // console.log(town);
        // console.log(city);
        // console.log(pincode);
        // console.log(state);



        const newaddress = {
            name: name,
            mobile: mobile,
            pincode: pincode,
            town: town,
            state: state,
            address: address
        }
    

        const user = await User.findOne({ _id: id })
        // user.address.push({name,mobile,town,state,address,pincode})
        const finduser = await useraddress.findOne({ user: user })
        if (finduser) {
            const update = await useraddress.findOneAndUpdate({ user: user }, { $push: { addresses: [newaddress] } })
            if (update) {
               
                res.redirect('/addresses')
            }

        } else {
            const create = await useraddress.create({ user: user, addresses: newaddress })
            
            res.redirect('/myaccount')
        }




        // console.log(user);
        // const updateaddress = await profilehelper.updateaddress(user,newaddress)

        // if(updateaddress){
        //     res.redirect('/myaccount')
        // }else{
        //     res.render('addaddress',{message:'An error occured while adding address'})
        // }

    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error")

    }
}

const error404 = async (req,res)=>{
    try{
        res.render('404')
    }catch(error){
        console.log(error)
        res.status(500).send("Internal Server Error")
    }
}

const logout = async (req, res) => {
    try {
       
        req.session.destroy()
        res.redirect('/')


    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error")

    }
}
module.exports = {
    register, login, insertuser,
    verifylogin, home, otplogin, shop, fpassword,
    postfpassword, sendotp, verifyotp,
    productview, userprofileload, loadaddaddress,addreview,filtershop,
     addaddress,addresses,loadmen,loadwomen, logout,error404
}



