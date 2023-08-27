const express = require('express')

const adminRoute = express()
const session = require('express-session')
const auth = require('../middlewares/adminmiddleware')
adminRoute.set('view engine', 'ejs')
adminRoute.set('views', './views/admin')
const adminController = require('../controllers/admincontroller')
const ordercontroller = require('../controllers/ordercontroller')
const couponcontroller = require('../controllers/couponcontroller')
const bannercontroller  = require('../controllers/bannercontroller')
const secretkey = require('../config/config')
const bodyparser = require("body-parser")
const nocache = require('nocache')
const path = require('path')
adminRoute.use(nocache());

adminRoute.use(bodyparser.json())

adminRoute.use(bodyparser.urlencoded({ extended: true }))

adminRoute.use(session({
    secret: secretkey, resave: false,
    saveUninitialized: true
}))


adminRoute.get('/', auth.islogin, adminController.login)

adminRoute.post('/', adminController.verifyadmin)

adminRoute.get('/dashboard', auth.isLogout, adminController.dashboard)

adminRoute.get('/editusers', adminController.editusers)

adminRoute.get('/blockusers', adminController.blockusers)

adminRoute.get('/blockedusers', adminController.blockedusers)

adminRoute.get('/unblockusers', adminController.unblockusers)

adminRoute.get('/unblockuser', adminController.unblockusers)

adminRoute.get('/productdata', adminController.productdata)

adminRoute.get('/insertproduct', adminController.insertproduct)

adminRoute.post('/insertproduct', adminController.addproducts)

adminRoute.get('/editproduct', adminController.loadeditproduct)

adminRoute.post('/editproduct', adminController.loadeditproduct)

adminRoute.post('/editeachproduct', adminController.editproducts)
 
adminRoute.get('/deleteproduct', adminController.deleteproduct)




adminRoute.get('/editcategories', adminController.loadeditcategories)

adminRoute.post('/editcategories', adminController.updatecategories)

adminRoute.get('/unlistedproducts',adminController.loadunlisted)

adminRoute.get('/listproduct',adminController.listproduct)

adminRoute.get('/unlistproduct',adminController.unlist)


adminRoute.put('/orderstatus',ordercontroller.orderstatus)

adminRoute.put('/cancelstatus',ordercontroller.cancelstatus)
adminRoute.put('/cancelorder',ordercontroller.cancelorder)

adminRoute.put('/returnorder',ordercontroller.returnstatus)



adminRoute.get('/orders',ordercontroller.orderslist)

adminRoute.get('/loadaddcoupon',couponcontroller.loadaddcoupon)

adminRoute.post('/addcoupon',couponcontroller.addcoupon)


adminRoute.get('/salesreport',adminController.salesreport)

adminRoute.post('/filtersales',adminController.filtersales)



adminRoute.get('/categories', adminController.loadcategories)

adminRoute.get('/addcategories', adminController.addcategories)
adminRoute.post('/addcategories', adminController.createcategories)

adminRoute.get('/deletecategories', adminController.deletecategories)

adminRoute.get('/generatecoupon',couponcontroller.generatecoupon)

adminRoute.get('/couponlist',couponcontroller.loadcoupnlist)

adminRoute.get('/addbanner',bannercontroller.loadaddbanner)
adminRoute.get('/banner',bannercontroller.listbanners)
adminRoute.post('/addbanner', bannercontroller.addbanner)
adminRoute.post('/editbanner', bannercontroller.editbanner)

adminRoute.get('/editbanner',bannercontroller.loadeditbanner)
adminRoute.get('/deletebanner',bannercontroller.deletebanners)




adminRoute.get('/logout', adminController.logout)



module.exports = adminRoute