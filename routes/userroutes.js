const express = require("express");

const userRoute = express();
const session = require("express-session");

userRoute.set("view engine", "ejs");
userRoute.set("views", "./views/users");

const cartcontroller = require("../controllers/cartcontroller");
const usercontroller = require("../controllers/usercontroller");
const nocache = require("nocache");
const bodyparser = require("body-parser");
const profilecontroller = require("../controllers/profilecontroller");
const ordercontroller = require("../controllers/ordercontroller");
const auth = require("../middlewares/middleware");
const wishlistcontroller = require("../controllers/wishlistcontroller");
const couponcontroller = require("../controllers/couponcontroller");

userRoute.get("/", usercontroller.home);
userRoute.get("/login", auth.islogin, usercontroller.login);
userRoute.post("/login", usercontroller.verifylogin);
userRoute.get("/register", usercontroller.register);
userRoute.post("/register", usercontroller.insertuser);

userRoute.post("/sendotp", usercontroller.sendotp);
userRoute.post("/", usercontroller.verifylogin);
userRoute.get("/home", auth.isLogout, usercontroller.home);
userRoute.get("/fpassword", usercontroller.fpassword);
userRoute.post("/fpassword", usercontroller.postfpassword);

userRoute.get("/otplogin", usercontroller.otplogin);
userRoute.post("/verifyotp", auth.islogin, usercontroller.verifyotp);
userRoute.get("/shop", usercontroller.shop);
userRoute.get("/productview", usercontroller.productview);

userRoute.get("/myaccount", usercontroller.userprofileload);
userRoute.get("/addaddress", usercontroller.loadaddaddress);
userRoute.post("/addaddress", usercontroller.addaddress);
userRoute.get("/addresses", usercontroller.addresses);
userRoute.get("/editaddres", profilecontroller.loadeditaddress);
userRoute.post("/editaddress", profilecontroller.editaddress);
userRoute.get("/deleteaddress", profilecontroller.deleteaddress);
userRoute.get("/changepassword", profilecontroller.loadchangepassword);
userRoute.post("/changepassword", profilecontroller.postchangepassword);

userRoute.post("/addcart", cartcontroller.addcart);
userRoute.post("/addcartt", cartcontroller.addcartt);
userRoute.get("/cart", auth.isauth, cartcontroller.viewcart);
userRoute.post("/decreasequantity", cartcontroller.decreasequantity);
userRoute.post("/icreasequantity", cartcontroller.increasequantity);
userRoute.post("/productremove", cartcontroller.productremove);
userRoute.get("/checkout", cartcontroller.loadcheckout);

userRoute.post("/confirmorder", ordercontroller.confirmorder);
userRoute.get("/orderdetials", ordercontroller.vieworder);
userRoute.get("/ordersdetials", ordercontroller.vieworders);
userRoute.put("/cancelorder", ordercontroller.cancelorder);
userRoute.post("/verify-payment", ordercontroller.verifypayment);

userRoute.post("/wallet-recharge", profilecontroller.rechargewallet);
userRoute.post("/verify-walletpayment", profilecontroller.verifyRechargewallet);

userRoute.get("/wishlist", wishlistcontroller.viewwishlist);
userRoute.post("/addwishlist", wishlistcontroller.addwishlist);
userRoute.post("/wishlistproductremove", wishlistcontroller.remove);

userRoute.get("/product-min-max", usercontroller.filtershop);
userRoute.get("/men", usercontroller.loadmen);
userRoute.get("/women", usercontroller.loadwomen);

userRoute.post("/add-review", usercontroller.addreview);
userRoute.get("/getinvoice", ordercontroller.invoice);

userRoute.get("/error,", usercontroller.error404);
userRoute.get("/verifycoupon", couponcontroller.verifycoupon);
userRoute.get("/applycoupon", couponcontroller.applycoupon);

userRoute.get("/logout", usercontroller.logout);

module.exports = userRoute;
