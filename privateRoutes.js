const router = require("express").Router();
const jwt = require("jsonwebtoken")
const jwtDecode = require("jwt-decode")
const exhbs = require("express-handlebars");
const path = require("path");
const verify = require("./tokenVerification.js");
require('dotenv').config()
const mongoose = require("mongoose");
const express = require("express");
const app = express()

//Try to connect to user account database
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/todo_app", {
     useNewUrlParser: true,
     useUnifiedTopology: true 
    }).then(() => {
        console.log("PrivateRoutes connected to database successfully");
    }).catch(err => {
        console.log(err);
});
let createNewTodo = mongoose.model("todo");
let newAccount = mongoose.model('newAccount');
app.use('/static', express.static(path.join(__dirname, "/views/static")))

//Landing page when logging in
router.get("/", verify, (req, res) => {
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
            //Search in database for todos containing clients username, and then send those to handlebars frontend
            createNewTodo.find({ "usersID": user.username }, (err, todos) => {
                if(err) console.log(err);

                if(todos) {
                    //console.log(todos);
                    let todoStringVar = JSON.stringify(todos, ["todo"]);
                    let todoArrayVar = JSON.parse(todoStringVar);
                    let todoItemsInArray = [];
                    for(i=0;i<Object.values(todoArrayVar).length;i++) {
                        todoItemsInArray.push(Object.values(todoArrayVar[i]));
                    }
                    console.log(todoItemsInArray);
                    
                    //console.log(todoItem);
                    res.render("todo", { accountStuff: user.username, todos: todoItemsInArray })
                }
            })
        } 


    })
});

// Redirect from logout button on ladning page to remove cookie and redirect to logging page
router.get("/logout", (req, res) => {
    res.clearCookie('token');
    res.redirect("https://todoappbyphiliphilding.herokuapp.com/");
})

router.get("*", (req, res) => {
    res.redirect("https://todoappbyphiliphilding.herokuapp.com/api/user")
})

module.exports = router 