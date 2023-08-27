const islogin = async (req, res, next) => {
    try {
        if (!req.session.user_id) {
            // User is not logged in, redirect to login page or perform appropriate action
           next()
            
        } else {
            // User is logged in, continue to next middleware
            res.redirect('/admin/dashboard')
        }
    } catch (error) {
        console.log(error);
    }
};

const isLogout =async (req,res,next)=>{
    try{
        if(!req.session.user_id){
            res.redirect('/admin')
        }else{
            next();
        }
    }catch(error){
        console.log(error);
    }
}

// const isLogout = async (req, res, next) => {
//     try {
//         if (!req.session.user_id) {
//             // User is not logged in, continue to next middleware
//             next();
//         } else {
//             // User is logged in, redirect to a different route or perform appropriate action
//             res.redirect('/logout');
//         }
//     } catch (error) {
//         console.log(error);
//     }
// };

module.exports = {
   
    islogin,isLogout
};
