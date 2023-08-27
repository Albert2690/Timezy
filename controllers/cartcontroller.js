const cart = require('../model/cartmodel')
const User = require('../model/usermodel')
const product = require('../model/productmodel')
const useraddress = require('../model/addressmodel')
const { Schema } = require('mongoose')
const { json } = require('body-parser')
const { login } = require('./usercontroller')

const addcart = async (req, res) => {
  try {
    const userid = req.session.user_id;
    const productid = req.query.id
    let length = userid.length
    if (productid.length !== length) {
      res.render('404')
    }
    const products = await product.findOne({ _id: productid });
    // console.log(productid);


    // console.log(userid+'addcart');

    let usercart = await cart.findOne({ user: userid });
    if (!usercart) {
      const newcart = new cart({
        user: userid,
        cartitems: [],
      });
      newcart.save();
      
      usercart = newcart;
    }
    const quantity = 1
    const total = products.price * quantity
    // if(products.discountpercentage&&products.validity>Date.now){
    //   total= Math.round(products.price*(100-products.discountpercentage)/100)
    // }
   
    const cartproduct = await cart.findOne({
      user: userid,
      "cartitems.product": productid, // Use dot notation to access the product _id within cartitems
    });



    if (!cartproduct) {
      await cart.findOneAndUpdate(
        { user: userid },
        {
          $push: { 'cartitems': { product: productid, quantity: quantity, total: total } },

        }
      );

     
    } else {
      res.send("Failed to add the product to cart")
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error")
  }
}

const addcartt = async (req, res) => {
  try {
    const userid = req.session.user_id;
    const productid = req.body.productid
   
    let length = userid.length
    if (productid.length !== length) {
      res.render('404')
    }
    const products = await product.findOne({ _id: productid });
    // console.log(productid);


    // console.log(userid+'addcart');

    let usercart = await cart.findOne({ user: userid });
    if (!usercart) {
      const newcart = new cart({
        user: userid,
        cartitems: [],
      });
      newcart.save();
     
      usercart = newcart;
    }
    const quantity = 1
    const total = products.price * quantity
   
    const cartproduct = await cart.findOne({
      user: userid,
      "cartitems.product": productid, // Use dot notation to access the product _id within cartitems
    });



    if (!cartproduct) {
      await cart.findOneAndUpdate(
        { user: userid },
        {
          $push: { 'cartitems': { product: productid, quantity: quantity, total: total } },

        }
      );

      
      res.json({status:true})
    } else {
      res.send("Couldn't Add the Item")
    }
  } catch (error) {
    console.log(error.message);
  }
}

const viewcart = async (req, res) => {
  try {
    const userid = req.session.user_id

    const user = await User.findOne({ _id: userid })


    const usercart = await cart.findOne({ user: userid }).populate("cartitems.product")
    const products = usercart?.cartitems ? usercart.cartitems : []
    if (usercart) {
      let cartlength = usercart?.cartitems?.length || 0
      // products.forEach((item)=>{
      //     console.log(item)
      //     console.log(item.product.price)

      // })
      let total = 0
      products.forEach((product) => {
        let itemtotal
        if(product.product.discountpercentage&&product.product.offervalidity>=Date.now()){
         itemtotal = Number((product.product.price *(100-product.product.discountpercentage)/100)* product.quantity)
         
        }else{
          itemtotal= Number(product.product.price*product.quantity)
          
        }
        total +=itemtotal
      })
      products.forEach(async (product) => {
        const productidToUpdate = product.product._id;
        const newQuantity = product.quantity; // Replace this with the new quantity value
        
        let  newTotal = 0; // Calculate the new total based on the new quantity
        if (product.product.discountpercentage&&product.product.offervalidity>=Date.now()){
          newTotal= Math.round((product.product.price *(100-product.product.discountpercentage)/100)* product.quantity)
        }else{
          newTotal = product.product.price * newQuantity;
        }
        await cart.findOneAndUpdate(
          { user: userid, 'cartitems.product': productidToUpdate },
          {
            $set: {

              'cartitems.$.total': newTotal,
            },
          }
        );
      })

      await cart.findOneAndUpdate({ user: userid }, { $set: { subtotal: total } })
      res.render('cart', { user, products, userid, subtotal: total, cartlength })

    } else {
      subtotal = 0
      cartlength = 0
      res.render('cart', { subtotal, cartlength, products, user, userid })
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error")
  }
}
const updatecart = async (req, res) => {
  try {
    const name = req.body.name
   
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error")
  }
}
const decreasequantity = async (req, res) => {
  try {
    const userid = req.session.user_id

   
    const productid = req.body.productid


    const usercart = await cart.findOne({ user: userid }).populate('cartitems.product')


    const productindex = usercart.cartitems.findIndex((item) => {
      return item.product._id.toString() == productid

    });
    // console.log(productindex);  

    if (productindex === -1) {
      return res.json({ success: false, message: 'cart item couldnot find' })
    }


    usercart.cartitems[productindex].quantity -= 1

    if (usercart.cartitems[productindex].quantity < 0) {
      usercart.cartitems.splice(productindex, 1);
    }

    if(usercart.cartitems[productindex].product.discountpercentage&&usercart.cartitems[productindex].product.offervalidity.getTime() >= Date.now()){
      usercart.subtotal -=Math.round((usercart.cartitems[productindex].product.price *(100-usercart.cartitems[productindex].product.discountpercentage)/100))
      usercart.cartitems[productindex].total -= Math.round((usercart.cartitems[productindex].product.price *(100-usercart.cartitems[productindex].product.discountpercentage)/100))
    }else{
    usercart.subtotal -= Number(usercart.cartitems[productindex].product.price)
    usercart.cartitems[productindex].total -= Number(usercart.cartitems[productindex].product.price)

    }
   

    await usercart.save();
 let total =0
 let subtotal=0

    if(usercart.cartitems[productindex].product.discountpercentage&&usercart.cartitems[productindex].product.offervalidity.getTime() >= Date.now()){
      
      total = Math.round((usercart.cartitems[productindex].product.price *(100-usercart.cartitems[productindex].product.discountpercentage)/100)* usercart.cartitems[productindex].quantity)
    }else{
     total = usercart.cartitems[productindex].product.price * usercart.cartitems[productindex].quantity
     
    }
    subtotal= Math.round(usercart.subtotal)
    const quantity = usercart.cartitems[productindex].quantity
    


    res.json({
      success: true,
      message: "Quantity updated successfully",
      total,
      quantity,
      subtotal
    })


  } catch (error) {
    console.log(error)
    res.status(500).send("Internal Server Error")
  }
}
const increasequantity = async (req, res) => {
  try {
    const productid = req.body.productid
   
    const userid = req.session.user_id
    // console.log(userid);

    const usercart = await cart.findOne({ user: userid }).populate('cartitems.product')

    //    const product = usercart.cartitems.forEach((item)=>{
    //         return item.product._id
    //     })
    // console.log(product);
    if (usercart) {


      const productindex = usercart.cartitems.findIndex((item) => {
        return item.product._id.toString() == productid

      });

      // console.log(productindex);
      if (productindex == -1) {
        return res.json({ success: false, message: "cart item couldnot Found" })
      }
      usercart.cartitems[productindex].quantity += 1
      if(usercart.cartitems[productindex].product.discountpercentage&&usercart.cartitems[productindex].product.offervalidity.getTime() >= Date.now()){
        usercart.subtotal +=Math.round((usercart.cartitems[productindex].product.price *(100-usercart.cartitems[productindex].product.discountpercentage)/100))
        usercart.cartitems[productindex].total+=Math.round((usercart.cartitems[productindex].product.price *(100-usercart.cartitems[productindex].product.discountpercentage)/100))

      }else{
      usercart.subtotal += Number(usercart.cartitems[productindex].product.price)
      usercart.cartitems[productindex].total += Number(usercart.cartitems[productindex].product.price)
      }
     
      
      

      const maxquantity = usercart.cartitems[productindex].product.stock

      if (usercart.cartitems[productindex].quantity > maxquantity) {
        return res.json({
          success: false,
          message: "Maximum quantity reached",
          maxquantity,
        })
      }
      await usercart.save()
       let subtotal=0
      let total=0
      if(usercart.cartitems[productindex].product.discountpercentage&&usercart.cartitems[productindex].product.offervalidity.getTime() >= Date.now()){
      
        total= Math.round((usercart.cartitems[productindex].product.price *(100-usercart.cartitems[productindex].product.discountpercentage)/100)* usercart.cartitems[productindex].quantity)
      }else{
       total = usercart.cartitems[productindex].product.price * usercart.cartitems[productindex].quantity
       
      }
      subtotal = Math.round (usercart.subtotal)
     
      const quantity = usercart.cartitems[productindex].quantity

      res.json({
        success: true,
        message: "quantity Updated Successfully",
        total,
        quantity,
        subtotal
      })
    }
  } catch (error) {
    res.json({ success: false, message: "Failed To Update Quantity" })
  }
}
const productremove = async (req, res) => {
  try {
    const productid = req.body.productid
    let userid = req.session.user_id

    const usercart = await cart.findOne({ user: userid })
    console.log(usercart);

    if (usercart) {
      const productindex = usercart.cartitems.findIndex((item) => {
        return item.product.toString() == productid

      });
      console.log(productindex);
      if (productindex > -1) {
        usercart.cartitems.splice(productindex, 1)
        const save = await usercart.save()
        
        const length = usercart.cartitems.length - 1
        res.json({
          status: true,
          message: "product removed successfully",
          length: length
        })
      } else {
        res.json({ status: false, message: "product not found" })
      }
    } else {
      res.json({ status: false, message: "cart not found" })
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error")
  }
}
const loadcheckout = async (req, res) => {
  try {
    let id = req.session.user_id
    let user = req.session.user
   

    const addressofdelivery = await useraddress.findOne({ user: id })
    // console.log(addressofdelivery);
    const usercart = await cart.findOne({ user: id }).populate('cartitems.product')
    let products = usercart.cartitems
    // console.log(products)
    const subtotal = Math.round(usercart.subtotal)

    if (addressofdelivery) {
      res.render('checkout1', { user: user, addresess: addressofdelivery.addresses, products, subtotal })
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error")
  }
}



module.exports = { addcart,addcartt, productremove, viewcart, updatecart, decreasequantity, increasequantity, loadcheckout } 