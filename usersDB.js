require("dotenv").config();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const express = require("express")
const app = express();
const cookieParser = require("cookie-parser");
const Schema = mongoose.Schema;


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

let todoSchema = new Schema({
    todo: {
        type: String
    },
    usersID: {
        type: String
    }
})

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

function createTodo(request, response, todoName, userID) {
    //Check if todo already exists
    createNewTodo.findOne({ "todo": todoName, "usersID": userID }, (err, todo) => {
        if(err) {
            console.log(err);
        }

        if(todo) {
            response.redirect("/api/user")
        } else if(todoName.length > 40) {
            response.redirect("/api/user");
        } else {
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
        
                response.redirect("/api/user")
        }
    })

}

function deleteTodo(request, response, todoName, userName) {
    createNewTodo.findOne({ "usersID": userName, "todo": todoName }, (err, todo) => {
        if(err) console.log(err);

        if(todo) {
            todo.remove();
            response.redirect("/api/user")
        } else {
            console.log(todoName + " " + userName)
            response.redirect("/api/user")

        }
    }) 
}

//Export modules for use in the main server app
//module.exports = newAccount
module.exports = { createUser, getUserFromID, createTodo, deleteTodo }