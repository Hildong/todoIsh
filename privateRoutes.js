const router = require("express").Router();
const jwt = require("jsonwebtoken")
const jwtDecode = require("jwt-decode")
const exhbs = require("express-handlebars");
const path = require("path");
const verify = require("./tokenVerification.js");
const mongoose = require("mongoose");
const express = require("express");
const app = express()

//Try to connect to user account database
mongoose.connect("mongodb://localhost:27017/todo_app", {
     useNewUrlParser: true,
     useUnifiedTopology: true 
    }).then(() => {
        console.log("PrivateRoutes connected to database successfully");
    }).catch(err => {
        console.log(err);
});
let newAccount = mongoose.model('newAccount');
//app.use('/static', express.static(path.join(__dirname, "views/static")))

router.get("/", (req, res) => {
    let token = undefined
    const authHeader = req.headers["cookie"].split(" ")[1]
    if(authHeader !== undefined) {
        token = authHeader.substring(6)
    }
    const decoded = jwtDecode(token)
    
    //Search in the database for the user, using the decoded tokens ID
    newAccount.findOne({ "_id": decoded.payload._id }, (err, user) => {
        if(err) return console.log(err)

        //If the user exist, return the data from the user 
        if(user) {
            res.render("todo", { accountStuff: `Logged in as ${user.username}` })
        } 
    })
})

router.get("*", (req, res) => {
    res.redirect("/api/user")
})

module.exports = router 