const User = require('../model/usermodel')
const multer = require('multer')
const Product = require('../model/productmodel')
const order = require('../model/ordersmodel')
const Categories = require('../model/categories')
const bcrypt = require('bcrypt')

const path = require('path')
const categories = require('../model/categories')
// const { default: orders } = require('razorpay/dist/types/orders')
// const { Schema } = require('mongoose')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/product-images/'))
    },
    filename: function (req, file, cb) {
        const filename = Date.now() + path.extname(file.originalname);
        cb(null, filename)
    }
})
const upload = multer({ storage: storage }).array('images', 5)
const login = async (req, res) => {
    try {
        res.render('login')
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error")
    }
}
const verifyadmin = async (req, res) => {
    try {
        const email = req.body.email
      
        const password = req.body.password
        const admin = await User.findOne({ email: email })
        if (admin) {
            const passwordmatch = await bcrypt.compare(password, admin.password)
            if (passwordmatch) {
                if (admin.is_admin > 0) {

                    req.session.user_id = admin._id
                    res.redirect('/admin/dashboard')
                } else {
                    res.render('login', { message: 'Incorrect password or invalid username  ' })
                }
            } else {
                res.render('login', { message: 'Incorrect password or invalid username  ' })
            }

        } else {
            res.render('login', { message: 'sorry Dude' })
        }

    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error")
    }
}
const dashboard = async (req, res) => {
    try {
        const orders = await order.aggregate([
            {$match:{
                status:"delivered"
            },
        },
           { $group:{
                _id:null,
                totalpricesum:{
                    $sum:{$toInt:'$total'} },
                    count:{$sum:1}
   
            }
        }
        ])
      

        const salesdata = await order.aggregate([
            {$match:{
                status:"delivered"
            },
        },
        {
            $group:{
                _id:{
                    $dateToString: {
                       format: "%Y-%m-%d",
                        date: "$createdAt",
                      },
                },
                dailysales:{
                    $sum:{
                        $toInt:'$total'
                    }
                },
                
            }
        },
        {
            $sort:{
                _id:1
            }
        }
        ])

        const salesCount = await order.aggregate([
           
            {
              $match: {
                status: "delivered", // Consider only completed orders
              },
            },
            {
              $group: {
                _id: {
                  $dateToString: {
                    // Group by the date part of createdAt field
                    format: "%Y-%m-%d",
                    date: "$createdAt",
                  },
                },
                orderCount: { $sum: 1 }, // Calculate the count of orders per date
              },
            },
            {
              $sort: {
                _id: 1, // Sort the results by date in ascending order
              },
            },
          ]);
      

        

        const productCountsByCategory = await Product.aggregate([
            {
              $group: {
                _id: "$category",
                count: { $sum: 1 }
              }
            }
          ]);
          
          const category = productCountsByCategory.length
    
          

        res.render('home',{salesdata,salesCount,orders,category,productCountsByCategory})
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error")
    }
}
const insertproduct = async (req, res) => {
    try {
        const categories = await Categories.find({})
        res.render('addproduct1', { category: categories })
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error")
    }
}
// const addproducts =async(req,res)=>{
//     try{

//           await upload(req,res,async (error)=>{
//             if(error instanceof multer.MulterError){
//                return res.status(500).send("Error while uploading image")
//             }else if(error){
//                return res.status(500).send('Error occured while uploading the image 21')
//             }
//             const newproduct = new Product ({
//                 name :req.body.productname,
//                 description:req.body.description,
//                 category:req.body.category,
//                 price :req.body.price,
//                 image:req.file.filename,
//                 is_listed:0
//             })
//            const save =  await newproduct.save()
//           console.log(newproduct.category);

//            save.then((resolve)=>{
//             res.render('productdata')
//            })
//            save.catch((error)=>{
//             console.log(error)
//            })
//         })
//         }catch(error){
//         console.log(error);

// }}
const addproducts = async (req, res) => {
    try {
        upload(req, res, async (error) => {
            if (error instanceof multer.MulterError) {
                return res.status(500).send("Error while uploading image");
            } else if (error) {
                return res.status(500).send("Error occurred while uploading the image");

            }

            try {
                //    console.log(req.body.category,"koooooooo"); 
                //    const  category= await Categories.findOne({name:req.body.category})
                //    console.log(category)
                //    console.log(category._id);
                const filenames = req.files.map((file) => file.filename);
                const newProduct = new Product({
                    name: req.body.productname,
                    description: req.body.description,
                    category: req.body.category,
                    price: req.body.price,
                    image: filenames,
                    stock: req.body.stock,
                    discountpercentage:req.body.discount,
                    offervalidity:req.body.validity,
                    is_listed: 0
                });

                await newProduct.save();

               
                res.redirect('/admin/productdata')
            } catch (error) {
                console.log(error);
                res.status(500).send("Error occurred while saving the product");
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).send("Error occurred");
    }
};

const editproducts = async (req, res) => {

    try {
        upload(req, res, async (error) => {
            if (error instanceof multer.MulterError) {
                return res.status(500).send("error while uploading the image")
            } else if (error) {
                return res.status(500).send("error while uploadin the image1")
            }


            try {
                const id = req.query.id
                // console.log(id + ':11')


              

                const product = await  Product.findOne({_id:id})
         
                const filenames =product.image?product.image: req.files.map((file) => file.filename)


                await Product.findOneAndUpdate({ _id: id }, {
                    $set: {
                        name: req.body.productname,
                        description: req.body.description,
                        category: req.body.category,
                        price: req.body.price,
                        image: filenames,
                        stock: req.body.stock,
                        discountpercentage:req.body.discount,
                        offervalidity:req.body.validity,
                    }
                })

                res.redirect('/admin/productdata')
            } catch (error) {
                console.log(error);
                res.status(500).send("Internal Server Error")
            }
        })

    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error")
    }
}

const editusers = async (req, res) => {
    try {
        var search = ''
        if (req.query.search) {
            search = req.query.search;

        }

        const userdata = await User.find({
            is_admin: 0, is_blocked: 0,
            $or: [{ name: { $regex: '.*' + search + '.*', $options: 'i' } },
            { eamil: { $regex: '.*' + search + '.*', $options: 'i' } },
            { mobile: { $regex: '.*' + search + '.*', $options: 'i' } },]
        })


        if (userdata) {
            res.render('users', { user: userdata })
        }
        // const userdatas = await User.find({ is_admin: 0,is_blocked:1,
        //     $or:[{name:{$regex:'.*'+search+'.*',$options:'i'}},
        //     {eamil:{$regex:'.*'+search+'.*',$options:'i'}},
        //     {mobile:{$regex:'.*'+search+'.*',$options:'i'}},]
        //     })
        //     if(userdatas){
        //         res.render('busers',{users:userdatas})
        //     }

    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error")
    }
}

const blockedusers = async (req, res) => {
    try {
        var search = ''
        if (req.query.search) {
            search = req.query.search;

        }

        const userdata = await User.find({
            is_admin: 0, is_blocked: 1,
            $or: [{ name: { $regex: '.*' + search + '.*', $options: 'i' } },
            { eamil: { $regex: '.*' + search + '.*', $options: 'i' } },
            { mobile: { $regex: '.*' + search + '.*', $options: 'i' } },]
        })


        if (userdata) {
            res.render('busers', { users: userdata })
        }
        // const userdatas = await User.find({ is_admin: 0,is_blocked:1,
        //     $or:[{name:{$regex:'.*'+search+'.*',$options:'i'}},
        //     {eamil:{$regex:'.*'+search+'.*',$options:'i'}},
        //     {mobile:{$regex:'.*'+search+'.*',$options:'i'}},]
        //     })
        //     if(userdatas){
        //         res.render('busers',{users:userdatas})
        //     }

    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error")
    }
}
//  const blockusers = async (req, res) => {
//     try {
//       const id = req.query.id;
//       console.log(id);
//       const user = await User.findOneAndUpdate(
//         { _id: id },
//         { $set: { 
//             is_blocked:1
//              } },

//       );

//       if (user) {
//         console.log("User is blocked");

//         res.render('users', { user: user, block: 'unblo' });
//       }else{

//       }
//     } catch (error) {
//       console.log(error);
//     }
//   };

const loadcategories = async (req, res) => {
    try {
        const categories = await Categories.find({})
       

        res.render('categories1', { category: categories })
    } catch (error) {
        console.log(error)
        res.status(500).send("Internal Server Error")
    }
}
const createcategories = async (req, res) => {
    try {
        const categories = new Categories({
            name: req.body.category,
            description: req.body.description
        })
       
        const save = categories.save()
        if (save) {
            res.redirect('/admin/categories')
        }
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error")
    }
}

const loadeditcategories = async (req, res) => {
    try {
        const id = req.query.id
        
        // console.log(id);

        res.render('editcategories', { category: id })
    } catch (error) {
        console.log(error)
    }
}
const addcategories = async (req, res) => {
    try {
        res.render('addcategories')
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error")
    }
}
const updatecategories = async (req, res) => {
    try {
        const id = req.query.id
        // console.log(id + ':20');
        // console.log(req.body.category);
        // console.log(req.body.description);

        const category = await Categories.findOneAndUpdate({ _id: id }, { $set: { name: req.body.category, description: req.body.description } })
        //    const category = await Categories.findOneAndUpdate({_id:id},{$set:{description:'helooo'}})
      

        if (category) {
            res.redirect('/admin/categories')
        } else {
            res.send(500).redirect('/editcategory', { message: 'Category couldnt update' })
        }

    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error")
    }
}
const deletecategories = async (req, res) => {
    try {
        const id = req.query.id
        const category = await Categories.deleteOne({ _id: id })
        res.redirect('/admin/categories')

    } catch (error) {
        console.log(error)
        res.status(500).send("Internal Server Error")
    }
}
const loadunlisted = async (req, res) => {
    try {
        const products = await Product.find({
            is_listed: 1
        }).populate('category')
        res.render('unlisted', { product: products })
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error")
    }
}
const listproduct = async (req, res) => {
    try {
        const id = req.query.id
        const product = await Product.findOneAndUpdate({ _id: id }, { $set: { is_listed: 0 } })

        res.redirect('/admin/unlistedproducts')
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error")
    }
}
const unlist = async (req, res) => {
    try {
        const id = req.query.id
        await Product.findOneAndUpdate({ _id: id }, { $set: { is_listed: 1 } })
        res.redirect('/admin/productdata')
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error")
    }
}
const blockusers = async (req, res) => {
    try {
        const id = req.query.id.toString()
        // console.log(id, 'jiiiiiiiiiiiii');
        const user = await User.findOneAndUpdate({ _id: id }, { $set: { is_blocked: 1 } })
        res.redirect('/admin/editusers')
    } catch (error) {
        console.log(error)
        res.status(500).send("Internal Server Error")
    }
}
const unblockusers = async (req, res) => {
    try {
        const id = req.query.id
        const user = await User.findOneAndUpdate({ _id: id }, { $set: { is_blocked: 0 } })
        res.redirect('/admin/blockedusers')
    } catch (error) {
        console.log(error)
        res.status(500).send("Internal Server Error")
    }
}
const productdata = async (req, res) => {
    try {
        const products = await Product.find({ is_listed: 0 }).populate('category')
        res.render('productdata1', { product: products })
        
    } catch (error) {
        console.log(error)
        res.status(500).send("Internal Server Error")
    }
}

const deleteproduct = async (req, res) => {
    try {
        const id = req.query.id
        await Product.deleteOne({ _id: id })
        res.redirect('/admin/productdata')
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error")
    }
}
const salesreport = async(req,res)=>{
    try{


        const preDate = Date.now()
        const postDate = Date.now()
        const sales = await order.find().limit(10).populate('items.product').populate('user')
        
        sales.forEach((item)=>{
        if(item.items){


       
        }

        })
        
        

        res.render('salesreport1',{sales,preDate,postDate})
    }catch(error){
        console.log(error)
        res.status(500).send("Internal server Error")
    }
}
const filtersales = async(req,res)=>{
    try{
        const predate = req.body.preDate
        const postdate = req.body.postDate

        const sales = await order.aggregate([
            {
              $match: {
                createdAt: {
                  $gte: new Date(predate + 'T00:00:00.000Z'),
                  $lte: new Date(postdate + 'T23:59:59.999Z')
                }
              }
            }
          ]);
      

       res.render('salesreport1',{sales,preDate:predate,postDate:postdate})
    }catch(error){
        console.log(error)
        res.status(500).send("Internal Server Error")
    }
}
const loadeditproduct = async (req, res) => {
    try {
        const id = req.query.id
        // console.log(id)
        const productss = await Product.findOne({ _id: id })
        const categories = await Categories.find({})

        


        res.render('editproducts', { product: id, products: productss, category: categories })

    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error")
    }
}
const logout = async (req, res) => {
    try {
        req.session.destroy()
        res.redirect('/admin')
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error")
    }
}




module.exports = {
    addcategories,
    login, verifyadmin, dashboard, addproducts, loadeditproduct,
    loadeditcategories, editusers, blockusers, unblockusers, productdata,
    insertproduct, editproducts, deleteproduct, loadcategories, createcategories,
    updatecategories, deletecategories, logout, blockedusers,salesreport, loadunlisted, listproduct, unlist,filtersales
}