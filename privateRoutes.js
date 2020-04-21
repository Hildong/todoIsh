const router = require("express").Router();
const verify = require("./tokenVerification.js");

let day = new Date().getDay();

router.get("/", verify , (req, res) => {
    res.json({
        title: `Hello ${req.user.username}`,
        time: `What a beautiful ${day}`
    })
})


module.exports = router 