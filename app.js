const express = require("express");
const exhbs = require("express-handlebars");
const path = require("path");
const bodyParser = require("body-parser");
const app = express();
const port = 8000 || process.env.PORT;


//MIDDLEWARE

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



// ROUTES

//Default route
app.get(["/", "/login", "/signin"], (req, res) => {
    res.render("login")
});

//Login 
app.get("/signup", (req, res) => {
    res.render("signup")
});

app.get("*", (req, res) => {
    res.send("404 error, route not found :(");
})


//POST requests for user data
app.post("/signupdata", (req, res) => {
    res.send(`Name: ${req.body.username}<br>Password: ${req.body.pwd}<br>Password confirmation: ${req.body.pwdconfirmation}`);
})

//Starting and opening port for requests
app.listen(port, () => console.log(`Listening to requests on port ${port}`));