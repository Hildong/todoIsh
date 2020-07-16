//Import functions, methods, frameworks etc
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const express = require("express");
const app = express()
require("dotenv").config()

//Use express function use to enable cookieparser for reading cookie
app.use(cookieParser())

//exporting a nameless function that verifys tokens from cookies to see if user can access private routes. If not, send them to first page.
module.exports = function (req, res, next) {
    //Obtain token from request header and use split as well as substring token, to remove everything not part of the token
    let token = undefined
    const authHeader = req.headers["cookie"].split(" ")[0]
    if(authHeader !== undefined) {
        token = authHeader.substring(6)
    } else if(token === null || token === undefined) return res.status(403).redirect(`https://todoappbyphiliphilding.herokuapp.com/`); //If there are any errors and the token is empty, send user back to login page. Not telling them what happend is bad design, but most likley it's someone trying to use a false token and trying something fishy. 

    //Verify the token
    jwt.verify(token, process.env.SECRET_TOKEN, (err, user) => {
        if(err) {
            //If token is expired, send user back to loginpage
            res.status(403).redirect("https://todoappbyphiliphilding.herokuapp.com/");
        } else { 
            //If token is valid, continue on
            req.user = user;
            next();
        }
    })
}