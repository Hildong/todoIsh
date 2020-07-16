//Import functions, methods, frameworks etc
require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express")
const app = express();
const cookieParser = require("cookie-parser");
const Schema = mongoose.Schema;

//Use express function use to enable cookieparser for reading cookie
app.use(cookieParser())


//Try to connect to user account database
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/todo_app", {
     useNewUrlParser: true,
     useUnifiedTopology: true 
    }).then(() => {
        console.log("userDB connected to database successfully");
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

//Create a new schema for todos and have a usersID (the users name) to see what todo is for what user
let todoSchema = new Schema({
    todo: {
        type: String
    },
    usersID: {
        type: String
    }
})

//Create a variable each for models of the schema to save, delete and read documents to the databases
let newAccount = mongoose.model('newAccount', signupSchema);
let createNewTodo = mongoose.model("todo", todoSchema);

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
            
                response.redirect("https://todoappbyphiliphilding.herokuapp.com/");
        }
    })
}

//Function for authenticating user
function getUserFromID(request, response, userID) {
    //Search in the database for the user, using the decoded tokens ID
    newAccount.findOne({ "_id": userID }, (err, user) => {
        if(err) return console.log(err)

        //If the user exist, return the data from the user 
        if(user) {
            response.json({
                title: `Hello ${user.username}`,
                time: `What a beautiful day`
            })
        } 
    })
}

//Function to create the todo
function createTodo(request, response, todoName, userID) {
    //Check if todo already exists
    createNewTodo.findOne({ "todo": todoName, "usersID": userID }, (err, todo) => {
        if(err) {
            console.log(err);
        }

        //If it does exist, just redirect the user back to the landing page
        if(todo) {
            response.redirect("https://todoappbyphiliphilding.herokuapp.com/api/user")
        } else if(todoName.length > 40) { //If the todo is longer than 40 characters, redirect the users back to the landing page
            response.redirect("https://todoappbyphiliphilding.herokuapp.com/api/user");
        } else {
            //Else, create and save todo & reidrect user back to the landing page
            let newTodo  = new createNewTodo();

            newTodo.todo = todoName;
            newTodo.usersID = userID;
        
            newTodo
                .save()
                .then(result => {
                    console.log(result);
                })
                .catch(err => {
                    console.log(err);
                })
        
                response.redirect("https://todoappbyphiliphilding.herokuapp.com/api/user")
        }
    })

}

//function to the delete todo
function deleteTodo(request, response, todoName, userName) {
    //Search if there is a todo in the database that matches the inputted name and the users username
    createNewTodo.findOne({ "usersID": userName, "todo": todoName }, (err, todo) => {
        //If there is any error, log that error to the console
        if(err) console.log(err); 

        //If the todo exist, delete it and redirect user back to landing page, else redirect the user anyways, but nothing more
        if(todo) {
            todo.remove();
            response.redirect("https://todoappbyphiliphilding.herokuapp.com/api/user")
        } else {
            response.redirect("https://todoappbyphiliphilding.herokuapp.com/api/user")
        }
    }) 
}

//Export modules for use in the main server app
module.exports = { createUser, getUserFromID, createTodo, deleteTodo }