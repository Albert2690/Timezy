const useraddress = require('../model/addressmodel')

const product = require('../model/productmodel')

const User = require('../model/usermodel')

const profilehelper = require('../helpers/profilehelper')
const bcrypt  = require('bcrypt')
const Razorpay = require('razorpay');

const securepassword = async (password)=>{
    try{
        const passwordhash = await bcrypt.hash(password,10)
        return passwordhash
    } catch(error){
        console.log(error);
        res.status(500).send("Internal Server Error")
    }
}


const loadeditaddress = async (req, res) => {
    try {
        const idd = req.query.id
      
        // const find =await useraddress.findOne({})
        res.render('editaddress', { id: idd })
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error")
    }
}
const editaddress = async (req, res) => {
    try {
        const id = req.body.id
     
        const userid = req.session.user_id
       

        const update = await useraddress.findOneAndUpdate({ user: userid, "addresses._id": id }, {
            $set: {
                'addresses.$.name': req.body.name,
                'addresses.$.mobile': req.body.mobile,
                'addresses.$.pincode': req.body.pincode,
                'addresses.$.town': req.body.town,
                'addresses.$.state': req.body.state,
                'addresses.$.address': req.body.address
            }
        })

        if (update) {
            res.redirect('/myaccount')
          
        }
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error")
    }
}
const deleteaddress = async (req, res) => {
    try {
        const id = req.query.id
        const user = req.session.user_id
        if (id) {
            const update = await useraddress.findOneAndUpdate({ user: user, "addresses._id": id }, { $pull: { addresses: { _id: id } } })
            res.redirect('/addresses')
        }

    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error")
    }
}
const loadchangepassword = async (req,res)=>{
    try{
        if(req.session.user){
            res.render('changepassword',{message:""})
        }
    }catch(error){
        console.log(error);
        res.status(500).json({message:"Internal Server Errror !!!"})
    }
}
const postchangepassword = async(req,res)=>{
    try{
        const oldpassword = req.body.currentpassword
        const userid = req.session.user_id
        
        const newpasword = req.body.newpassword
        const confirmpassword = req.body.confirmpassword
        const userdetials =await User.findOne({_id:userid})
        

       if(userdetials){
        
        

      const verified = await bcrypt.compare(oldpassword, userdetials.password);

        

         if(verified&&newpasword===confirmpassword){
           
            const secured = await securepassword(newpasword)
            if(secured){
                 await User.findOneAndUpdate({_id:userid},{$set:{password:secured}})
                 res.render('changepassword',{message:"Updated successfully"})
            
            }else{
                res.render('changepassword',{message:"Updation failed to incorrect detials"}) 
            }
      

       }else{
        res.render('changepassword',{message:'User Not Defined'})
       }
    }else{
        res.send("User Not Found")
    }
    }catch(error){
        console.log(error);
        res.status(500).json({message:"Internal Server Error"})
    }
}


const rechargewallet = async(req,res)=>{
    try{
        const userid  = req.session.user_id
        const rechargeamount = req.body.amount
        // console.log(rechargeamount);
        const result  = await profilehelper.generaterazorpaywallet(userid,rechargeamount)
        if(result){
            // console.log(result)
            res.json({order:result,orderstatus:true})
        }else{
            res.json({orderstatus:false})
        }
     
        
    }catch(error){
        res.status(500).json({message:"Internal Server Error Occured"})
        console.log(error);
    }
}

const verifyRechargewallet  = async(req,res)=>{
    try{
        const userid = req.session.user_id
        const amount  = Number(req.body.order.amount/100)
        // console.log(amount,'hiuuuu');
        await profilehelper.verifypayment(req.body.response).then(async()=>{
           const user =  await  User.findOne({_id:userid})
           user.wallet+=amount
           user.save();
           await User.findOneAndUpdate({_id:userid},{$push:{
            walletTransactions:{
                message:"Credited",
                createdAt:Date.now(),
                amount:amount
            }
           }})
        }).then(()=>{
            
            res.json({success:true})
        })
    }catch(error){
        console.log(error);
        res.status(500).json({message:"Internal Server Error"})
    }
}





module.exports = { editaddress, loadeditaddress, deleteaddress,loadchangepassword,
    postchangepassword,rechargewallet,verifyRechargewallet}