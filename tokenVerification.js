const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const express = require("express");
const app = express()
require("dotenv").config()


app.use(cookieParser())

module.exports = function (req, res, next) {
    const authHeader = req.cookies.token;
    console.log(authHeader)
    
    if(authHeader === null || authHeader === undefined) return res.status(401).send("Missing token")

    jwt.verify(authHeader, process.env.SECRET_TOKEN, (err, user) => {
        if(err) {
            console.log(err)
            res.status(403).send("Access denied");
        } else {  
            req.user = user;
            next();
        }
    })
}