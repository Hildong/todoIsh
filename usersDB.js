require("dotenv").config();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const express = require("express")
const app = express();
const cookieParser = require("cookie-parser");
const Schema = mongoose.Schema;


app.use(cookieParser())


//Try to connect to user account database
mongoose.connect("mongodb://localhost:27017/todo_app", {
     useNewUrlParser: true,
     useUnifiedTopology: true 
    }).then(() => {
        console.log("Connected to database successfully");
    }).catch(err => {
        console.log(err);
});


//Create a new schema for people to create accounts
let signupSchema = new Schema({
    username: {
        type: String
    },  
    password: {
        type: String
    }
});

let newAccount = mongoose.model('newAccount', signupSchema);


//Function for creating user
function createUser(uname, pwd, response) {
    //Check if user already exists
    newAccount.findOne({ "username": uname }, (err, user) => {
        //Console.log potential errors
        if(err) {
            console.log(err)
        }

        //If user exists, send err msg to client
        if(user) {
            response.render("signup", { signupMsg: "Username already exists" })
        } else {
            //If user doesn't exist, create the user
            let newUser = new newAccount();

            newUser.username = uname;
            newUser.password = pwd;
        
            newUser
                .save()
                .then(result => {
                    console.log(result);
                })
                .catch(err => {
                    console.log(err)
                })
            
            response.send(`Name: ${uname}<br>Password: ${pwd}`);

        }
    })
}

//Function for authenticating user
function login(uname, pwd, request, response) {
    //Checking for username to see if such a user exists on login
}



//Export modules for use in the main server app
module.exports = { createUser, login }
module.exports = newAccount