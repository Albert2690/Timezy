
const mongoose = require("mongoose")
const path = require('path')
require('dotenv').config();
mongoose.connect(process.env.MONGODB)
const express = require('express')
const app = express();
const userRoute = require('./routes/userroutes');
const adminRoute = require("./routes/adminroutes");
const bodyparser =require('body-parser')
const nocache =require('nocache')
app.set('views', path.join(__dirname, 'views'));
app.set('partials', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
const port = process.env.PORT || 3080;
const session = require ("express-session")
app.use(express.json())


app.use(express.urlencoded({extended:true}))
app.use(nocache())
const secretkey = require('./config/config')
app.use(session({
    secret: secretkey, resave: false,
    saveUninitialized: true
}))
app.use('/', userRoute)
app.use('/admin', adminRoute)
app.listen(port, () => {
    console.log(`running in port ${port}`);
})