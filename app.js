const express = require("express");
const exhbs = require("express-handlebars");
const path = require("path");
const bodyParser = require("body-parser");
const db = require("./usersDB.js")
const cookieParser = require("cookie-parser");
const privateRoutes = require("./privateRoutes.js");
const verify = require("./tokenVerification.js");

let day = new Date().getDay();
const app = express();
const port = 8000 || process.env.PORT;



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
    db.login(req.body.username, req.body.pwd, req, res);
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