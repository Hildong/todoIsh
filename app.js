const express = require("express");
const exhbs = require("express-handlebars");
const path = require("path");
const bodyParser = require("body-parser");
const db = require("./usersDB.js")
const cookieParser = require("cookie-parser");
const privateRoutes = require("./privateRoutes.js");
const jwt = require("jsonwebtoken")
const verify = require("./tokenVerification.js");
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

//Try to connect to user account database
mongoose.connect("mongodb://localhost:27017/todo_app", {
     useNewUrlParser: true,
     useUnifiedTopology: true 
    }).then(() => {
        console.log("Connected to database successfully");
    }).catch(err => {
        console.log(err);
});

let day = new Date().getDay();
const app = express();
const port = 8000 || process.env.PORT;
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
    res.send("hello");
})


//POST requests for user data
app.post("/signupdata", (req, res) => {
    if(req.body.pwd != req.body.pwdconfirmation) {
        res.render("signup", { signupMsg: "Passwords not matching" })
    } else {
        db.createUser(req.body.username, req.body.pwd, res);
    }
})

app.post("/signindata", async (req, res) => {
    newAccount.findOne({ "username": req.body.username }, (err, user) => {
        //Console.log potential errors
        if(err) {
            console.log(err)
        }

        //If user exists, check if inputted password matches users password
        if(user) {
            if(user.password === req.body.pwd) {
                //Use JWT to authorize and send a token to user 
                let payload = { _id: user._id };
                const token = jwt.sign({payload}, process.env.SECRET_TOKEN);
                res.cookie("token", token).send("ues");
            } else {
                res.render("login", { loginErr: "Username and password doesn't match" })
            }
        } else {
            res.render("login", { loginErr: "No user with that username exists" })
        }
    })
})


//Private routes
/*app.get("/api/user", verify, (req, res) => {
    res.json({
        title: `Hello brother`,
        time: `What a beautiful ${day}`
    })
    
})*/


//404 Route
app.get("*", (req, res) => {
    res.send("404 error, route not found :(");
})

//Starting and opening port for requests
app.listen(port, () => console.log(`Listening to requests on port ${port}`));