const express = require("express");
const app = express();

app.get("/", function(req, res) {
    
    res.send("it works!");
    
});

app.listen(process.env.PORT, process.env.IP, function() {
    
    console.log("Express server is runnning");
    
});