const cart = require("../model/cartmodel");
const User = require("../model/usermodel");
const product = require("../model/productmodel");
const useraddress = require("../model/addressmodel");
const { Schema } = require("mongoose");
const { json } = require("body-parser");
const { login } = require("./usercontroller");
const wishlist = require("../model/wishlist");
const { LEGAL_TCP_SOCKET_OPTIONS } = require("mongodb");

const addwishlist = async (req, res) => {
  try {
    const productid = req.body.productid;

    const user = req.session.user;
    const userwishlist = await wishlist.findOne({ user: user._id });
    if (!userwishlist) {
      const userwishlists = new wishlist({
        user: user._id,
        items: [{}],
        createdAt: Date.now(),
      });
      userwishlists.save();
    }
    const existing = userwishlist.items.findIndex((item) => {
      return item.product === productid;
    });

    if (existing === -1) {
      const hello = await wishlist.findOneAndUpdate(
        { user: user._id },
        { $push: { items: { product: productid } } }
      );
      if (hello) {
      }
    }

    res.status(200).json({ message: "added to wishlist" });
  } catch (error) {
    res.status(500).json({ message: "internal server Error" });
    console.log(error);
  }
};

const viewwishlist = async (req, res) => {
  try {
    const userid = req.session.user_id;

    const userwishlist = await wishlist
      .findOne({ user: userid })
      .populate("items.product");
    const usercart = await cart.findOne({ user: userid }).populate("cartitems");

    const cartlength = usercart?.cartitems?.length || 0;
    const products = userwishlist.items;
    //   products.forEach((item)=>{
    //         console.log(item.product.name,'kiiiii');
    //     })

    // console.log(products);
    if (userwishlist) {
      res.render("wishlist", { products, cartlength });
    } else {
      res.redirect("/home");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server Errror" });
  }
};
const remove = async (req, res) => {
  try {
    const productid = req.body.productid;
    const userid = req.session.user_id;
    const update = await wishlist.findOneAndUpdate(
      { user: userid },
      { $pull: { items: { product: productid } } }
    );
    if (update) {
      res.json({ status: true, message: "product removed" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = { viewwishlist, addwishlist, remove };
