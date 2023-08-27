
const banner = require('../model/bannermodel')
const path = require('path')
const multer = require('multer')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/banner-images/'))
    },
    filename: function (req, file, cb) {
        const filename = Date.now() + path.extname(file.originalname);
        cb(null, filename)
    }
})
const upload = multer({ storage: storage }).single('images')

const listbanner = async(req,res)=>{
    try{
        const banners = await banner.find()
        res.render('listbanners',{banners})
    }catch(error){
        console.log(error)
        res.status(500).send("Internal Server Error")
    }
}

const loadaddbanner = async (req,res)=>{
    try{

        res.render('addbanner')

    }catch(error){
        console.log(error)
        res.status(500).json({message:"Internal Server Error"})
    }
}

const addbanner = async (req, res) => {
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
                const filename = req.file.filename;
               
                let title = req.body.title

                const newbanner = new banner({
                    title:title,
                    image:req.file.filename
                })
                 await newbanner.save()
               
                res.redirect('/admin/banner')
            } catch (error) {
                console.log(error);
                res.status(500).send("Error occurred while saving the product");
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).send("Error occurred");
    }
    // try {
    //     const title = req.body.title;
    //     console.log(req.body);
    //     console.log(req.body,"hhjjkh")

        // const uploadPromise = new Promise((resolve, reject) => {
        //     upload(req, res, (error) => {   
        //         if (error instanceof multer.MulterError) {
        //             reject("Error while uploading image");
        //         } else if (error) {
        //             reject("Error occurred while uploading the image");
        //         } else {
        //             resolve();
        //         }
        //     });
        // });

        // // Wait for the image upload to complete
        // await uploadPromise;

        // try {
        //    console.log(title)
        // //    const filenames = req.files.map((file) => file.filename);
        //     const newbanner = new banner({
        //         title: title,
        //         image: req.file.filename,
        //     });

        //     await newbanner.save();
        //  return res.json({success:true})
            
        // } catch (error) {
        //     console.log("Error during banner creation:", error);
        //     res.status(500).json({ message: "Error during banner creation" });
        // }

    // } catch (error) {
    //     console.log("Internal Error:", error);
    //     res.status(500).json({ message: "Internal Error" });
    // }
};

const listbanners = async(req,res)=>{
    try{
        const banners = await banner.find({})

        res.render('listbanner',{banners})
    }catch(error){
        console.log(error)
        res.status(500).send("Internal Server Error")
    }
}
const deletebanners = async (req,res)=>{
    try{
        const bannerid = req.query.id
        console.log(bannerid);
        await banner.findOneAndDelete({_id:bannerid})
        res.redirect('/admin/banner')
    }catch(error){
        console.log(error);
        res.status(500).send("Internal Server Error")
    }
}
const loadeditbanner = async(req,res)=>{
    try{
         const id = req.query.id
         const banners = await banner.findOne({_id:id})
        
         res.render("editbanner",{banners})
    }catch(error){
        console.log(error)
        res.status(500).send("Internal Server Error")
    }
}
const editbanner = async(req,res)=>{
    try{
        upload(req, res, async (error) => {
            if (error instanceof multer.MulterError) {
                return res.status(500).send("Error while uploading image");
            } else if (error) {
                return res.status(500).send("Error occurred while uploading the image");

            }

            try {
               
                let id = req.body.id

                const banners = await banner.findOne({_id:id})
                let title = req.body.title

                let images = req.file?.filename?req.file.filename:banners.image
               
                const edit = await banner.findOneAndUpdate({_id:id},{$set:{title:title,image:images}})
                res.send("Success");
            } catch (error) {
                console.log(error);
                res.status(500).send("Error occurred while saving the product");
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).send("Error occurred");
    }
        
   
}


module.exports= {
    loadaddbanner,addbanner,listbanners,deletebanners,loadeditbanner,editbanner
}