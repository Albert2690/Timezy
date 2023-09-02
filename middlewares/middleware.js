const islogin = async (req, res, next) => {
  try {
    if (!req.session.user) {
      // User is not logged in, redirect to login page or perform appropriate action
      next();
    } else {
      // User is logged in, continue to next middleware
      res.redirect("/home");
    }
  } catch (error) {
    console.log(error);
  }
};

const isauth = async (req, res, next) => {
  try {
    if (req.session.user) {
      next();
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.log(error);
  }
};
const isLogout = async (req, res, next) => {
  try {
    if (!req.session.user) {
      res.redirect("/");
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
  }
};

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
  islogin,
  isLogout,
  isauth,
};
