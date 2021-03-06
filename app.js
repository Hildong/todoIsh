//Import functions, methods, frameworks etc
const express = require("express");
const exhbs = require("express-handlebars");
const path = require("path");
const bodyParser = require("body-parser");
const db = require("./usersDB.js")
const cookieParser = require("cookie-parser");
const privateRoutes = require("./privateRoutes.js");
const jwt = require("jsonwebtoken")
const mongoose = require("mongoose");
const app = express();
const port = process.env.PORT || 8000;
require('dotenv').config()


//Try to connect to user account database
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/todo_app", {
     useNewUrlParser: true,
     useUnifiedTopology: true 
    }).then(() => {
        console.log("Server connected to database successfully");
    }).catch(err => {
        console.log(err);
});

//Create a variable for models of the schema newAccount to read documents (users) to the databases
let newAccount = mongoose.model('newAccount');


//MIDDLEWARE

//Route middleware
app.use("/api/user", privateRoutes);

//Handlebars middleware
app.engine('handlebars', exhbs({
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, "views/layouts")
}));
app.set("view engine", "handlebars")

//css middleware 
app.use('/static', express.static(path.join(__dirname, "views/static")))

//Body-parser middleware
app.use(bodyParser.urlencoded({ extended: true })); 

//Cookie-parser middleware
app.use(cookieParser())



// ROUTES

//Default route
app.get(["/", "/login", "/signin"], (req, res) => {
    res.render("login")
});

//Login 
app.get("/signup", (req, res) => {
    res.render("signup")
});

//Test route
app.get("/api", (req, res) => {
    res.render("hello");
})


//POST requests for user data
app.post("/signupdata", (req, res) => {
    //Use regex to see if username & password lives up to different criterias
    if(req.body.pwd != req.body.pwdconfirmation) {
        res.render("signup", { signupMsg: "Passwords not matching" })
    } else if(req.body.pwd.length < 8) {
        res.render("signup", { signupMsg: "Password need to be longer than 8 characters." })
    } else if(/.*?(?:[a-z].*?[0-9]|[0-9].*?[a-z]).*?/i.test(req.body.pwd) === false) {
        res.render("signup", { signupMsg: "Password needs to contain both letters and numbers." })
    } else if(/^[0-9a-zA-Z]+$/.test(req.body.username) === false) {
        res.render("signup", { signupMsg: "Username may only contain english characters and numbers" })
    } else if(/^[0-9a-zA-Z]+$/.test(req.body.pwd)) {
        db.createUser(req.body.username, req.body.pwd, res);
    } else {
        res.render("signup", { signupMsg: "Password needs to be atleast 8 characters long and contain only numbers and english letters." })
    }
})

//POST request to sign in and create an accesstoken for user s
app.post("/signindata", async (req, res) => {
    //Search in database after username matching inputted username by user 
    newAccount.findOne({ "username": req.body.username }, (err, user) => {
        //Console.log potential errors
        if(err) return console.log(err)

        //If user exists, check if inputted password matches users password
        if(user) {
            if(user.password === req.body.pwd) {
                //Use JWT to authorize and send a token to user 
                let payload = { _id: user._id };
                const token = jwt.sign({payload}, process.env.SECRET_TOKEN, { expiresIn: "1h" });
                res.cookie("token", token).redirect("/api/user");
            } else {
                res.render("login", { loginErr: "Username and password doesn't match" })
            }
        } else {
            res.render("login", { loginErr: "No user with that username exists" })
        }
    })
})

//POST requests to add a todo when the user clicks "ADD" button on landing page site
app.post("/addtodo", (req, res) => {
    //If the todo is empty, and they have been trying to mess with the html in inspecter, tell them off. Otherwise, call createTodo.
    if(req.body.todo != "" && req.body.todo != " ") {
        db.createTodo(req, res, req.body.todo, req.body.accountName);
    } else {
        res.render("todo", {todoErrMsg: "Cannot add empty todo"});
    }
})

//POST requests to deletetodo, just call the function when this post requests is called by button click on frontend, and let function delete todo
app.post("/deletetodo", (req, res) => {
    db.deleteTodo(req, res, req.body.delete_todo, req.body.usersName)
})

//404 Route, everytime the user try to pass in a route that doesn't exist, send them back to login back 
app.get("*", (req, res) => {
    res.redirect("https://todoappbyphiliphilding.herokuapp.com/");
})

//Starting and opening port for requests
app.listen(port, () => console.log(`Listening to requests on port ${port}`));