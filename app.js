const express = require("express")
const app = express();
const pool = require("./dbPool.js");
const fetch = require("node-fetch");
const session = require('express-session');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const mysql = require('mysql');

app.set("view engine", "ejs");
app.use(express.static("public"));

app.use(session({
    secret: "top secret!",
    resave: true,
    saveUninitialized: true
}));

app.use(express.urlencoded({extended: true}));

//routes
app.get("/", isAuthenticated, async function(req, res) {
    let welcomeName;
    res.render("index", {"welcomeName": req.session.userLogged});
});

//starting server
app.listen(process.env.PORT, process.env.IP, function() {
    console.log("Express server is running...");
    
    
});

//////////////// Reviews code //////////////////

//Currently not completely functional.
app.get("/allReviews", isAuthenticated, function(req, res) {
  
  let sql = "SELECT DISTINCT products_ASIN FROM reviews";

  pool.query(sql, function(err, rows, fields) {
  
    if (err) throw err;
    console.log(rows);
    if (rows == "") {
    
      //Some other value may work.
      res.render("allReviews", {"rows" : rows});
    
    }
  
    else {
    
      res.render("allReviews", {"rows" : rows});
    
    }
  
  });
  
});

//I am unsure whethere we need a whole route for this.
app.get("/helpful", function(req, res) {
  
  console.log("ID is " + req.param('id'));
  console.log("ASIN is " + req.param('asin'));
  let id = "";
  if (req.param('id')) {
    
    id = req.param('id');
    
  }
  
  if (id == "") {
     
      //Don't actually return, the page will be stuck in limbo. Just render the previous page.
      return;
     
  }
  
  let asin = "";
  if (req.param('asin')) {
    
    id = req.param('asin');
    
  }
  
  if (asin == "") {
     
      //Don't actually return, the page will be stuck in limbo. Just render the previous page.
      return;
     
  }
  
  if (typeof(req.session.userLogged) != "undefined") {
    
    let sql = "UPDATE reviews SET helpfulVotes = helpfulVotes + 1 WHERE reviews.idreviews = " + id;
    pool.query(sql, function(err) {
    
      if (err) throw err;
    
    });
    
    res.redirect("/review?asin=" + asin);
  
    //This code should be removed before submission, it is only here for posterity and in case something buggy happens.
    /*sql = "SELECT * FROM reviews WHERE reviews.products_ASIN = " + asin;
    pool.query(sql, function(err, rows, fields) {
    
      if (err) throw err;
      console.log(rows);
      if (rows == "") {
      
        res.render("review", {"rows" : "It looks like there are no reviews for this product yet.", "id" : id, "asin" : asin});
      
      }
    
      else {
      
        res.render("review", {"rows" : rows, "id" : id, "asin" : asin});
      
      }
    
    });*/
  
  }
  
  else {
    
    res.render("login");
    
  }
  
});

//I am unsure whethere we need a whole route for this.
app.get("/unhelpful", function(req, res) {
  
  console.log("ID is " + req.param('id'));
  console.log("ASIN is " + req.param('asin'));
  let id = "";
  if (req.param('id')) {
    
    id = req.param('id');
    
  }
  
  if (id == "") {
     
      //Don't actually return, the page will be stuck in limbo. Just render the previous page.
      return;
     
  }
  
  let asin = "";
  if (req.param('asin')) {
    
    id = req.param('asin');
    
  }
  
  if (asin == "") {
     
      //Don't actually return, the page will be stuck in limbo. Just render the previous page.
      return;
     
  }
  
  if (typeof(req.session.userLogged) != "undefined") {
    
    let sql = "UPDATE reviews SET unhelpfulVotes = unhelpfulVotes + 1 WHERE reviews.idreviews = " + id;
    pool.query(sql, function(err) {
    
      if (err) throw err;
    
    });
    
    res.redirect("/review?asin=" + asin);
  
    //This code should be removed before submission, it is only here for posterity and in case something buggy happens.
    /*sql = "SELECT * FROM reviews WHERE reviews.products_ASIN = " + asin;
    pool.query(sql, function(err, rows, fields) {
    
      if (err) throw err;
      console.log(rows);
      if (rows == "") {
      
        res.render("review", {"rows" : "It looks like there are no reviews for this product yet.", "id" : id, "asin" : asin});
      
      }
    
      else {
      
        res.render("review", {"rows" : rows, "id" : id, "asin" : asin});
      
      }
    
    });*/
  
  }
  
  else {
    
    res.render("login");
    
  }
  
});

app.get("/newReview", function(req, res) {
  
  //Debug
  console.log("User logged in is " + req.session.userLogged);
  console.log("Is authenticated is " + (typeof(req.session.userLogged) != "undefined"));
  
  //isAuthenticated does not halt function() here, so we must manually check.
  if (typeof(req.session.userLogged) != "undefined") {
  
    console.log(req.query.id);
    console.log(req.query.asin);
    let id = "";
    if (req.query.id) {
     
        id = req.query.id;
     
    }
   
    if (id == "") {
     
        //or other dummy value
        id = -1;
     
    }
    
    let asin = "";
    if (req.param('asin')) {
    
      asin = req.param('asin');
    
    }
  
    if (asin == "") {
     
      console.log("here");
      //Don't actually return, the page will be stuck in limbo. Just render the previous page.
      return;
     
    }
  
    console.log("Attempted to leave review! Text is " + req.query.itemReview);
  
    //Needs to be updated to use userid.
    let sql = "INSERT INTO reviews (idreviews, helpfulVotes, unhelpfulVotes, reviewText, products_productID, users_userID, products_ASIN) VALUES (DEFAULT, 0, 0, '" + req.query.itemReview + "', " + id + ", 0, '" + asin + "')";
    pool.query(sql, function(err) {
    
      if (err) throw err;
    
    });
    
    res.redirect("/review?asin=" + asin);
  
  }
  
  else {
    
    res.render("login");
    
  }
  
  
});

app.get('/review', function (req, res) {
  
  let id = "";
  if (req.query.id) {
     
      id = req.query.id;
     
  }
   
  if (id == "") {
     
      //or other dummy value
      id = -1;
     
  }
  
  let asin = "";
  if (req.param('asin')) {
    
    asin = req.param('asin');
    
  }
  
  if (asin == "") {
     
      //Don't actually return, the page will be stuck in limbo. Just render the previous page.
      return;
     
  }
  
  console.log("id is " + id + " and asin is " + asin);
  
  let sql = "SELECT * FROM users RIGHT OUTER JOIN reviews ON users.userID = reviews.users_userID WHERE reviews.products_ASIN = '" + asin + "';"
  pool.query(sql, function(err, rows, fields) {
    
    if (err) throw err;
    console.log(rows);
    //Log whether something was returned or not.
    console.log(Object.keys(rows).length === 0);
    if (Object.keys(rows).length === 0) {
      
      res.render("review", {"rows" : "It looks like there are no reviews for this product yet.", "id" : id, "asin" : asin});
      
    }
    
    else {
      
      res.render("review", {"rows" : rows, "id" : id, "asin" : asin});
      
    }
    
  });
    
});

//////////////// Products code //////////////////

app.get("/search", isAuthenticated, async function(req, res) {
    
    let keyword = "";
    if (req.query.keyword) {
        keyword = req.query.keyword;
    }
    
    if (keyword == "") {
      keyword = "Other";
    }
    
    let keywordEncoded = encodeURIComponent(keyword.trim());
    
    let apiUrl = "https://amazon-product-reviews-keywords.p.rapidapi.com/product/search?keyword=outdoor" + "%20" + keywordEncoded + "&category=aps&country=US";
    
    let response = await fetch(apiUrl, {
  	  "method": "GET",
  	  "headers": {
  		"x-rapidapi-key": "c68ddd2c93msh87ac62bb6bd8ccbp14aa77jsn572dc527509e",
  		"x-rapidapi-host": "amazon-product-reviews-keywords.p.rapidapi.com"
    }
    });
    
   	let data = await response.json();
    
    let maxProducts = 5;
    let numProducts = maxProducts;
    let sql;
    let sqlParams;
    
    if (data.products.length < maxProducts) {
      numProducts = data.products.length;
    }
    
    let i = 0;
    
    for (let k= 0; k < numProducts; k++) {
      i = Math.floor(Math.random() * (data.products.length - 1) + 1);
      try {
        sql = "INSERT IGNORE INTO products (asin, imageUrl, keyword, title, price, url) VALUES (?,?,?,?,?,?)";
        sqlParams = [data.products[i].asin, data.products[i].thumbnail, keyword, data.products[i].title, data.products[i].price.current_price, data.products[i].url];
        pool.query(sql, sqlParams, function (err, rows, fields) {
          if (err) throw err;
        });
      }
      catch(err) {
        console.error(err);
      }
    }
    
    res.render("results", {"keyword":keyword});
}); 

app.get("/api/updateDatabase", function(req, res){
  let sql;
  let sqlParams;
  switch (req.query.action) {
    case "add": sql = "INSERT IGNORE INTO products (asin, imageUrl, keyword, title, price, url) VALUES (?,?,?,?,?,?)";
                sqlParams = [req.query.asin, req.query.keyword, req.query.title, req.query.price, req.query.url, req.query.asin];
                break;
    case "delete": sql = "DELETE FROM products WHERE asin = ?";
                sqlParams = [req.query.asin];
                break;
  }//switch
  pool.query(sql, sqlParams, function (err, rows, fields) {
    if (err) throw err;
    res.send(rows.affectedRows.toString());
  });
});//api/updateDatabase

//the main api for retrieving products from the database
app.get("/api/getItems", function(req, res){
  let sql;
  let sqlParams;
  
  switch (req.query.action) {
    case "asin": sql = "SELECT * FROM products WHERE asin = ? ORDER BY id DESC";
                sqlParams = [req.query.asin];
                break;
    case "keyword": sql = "SELECT * FROM products WHERE keyword = ? ORDER BY id DESC";
            sqlParams = [req.query.keyword];
            break;
  }
  pool.query(sql, sqlParams, function (err, rows, fields) {
    if (err) throw err;
    
    let htmlString = "";
    
    if (rows.length == 0) { 
        htmlString = "<br><img class='noResultsImage' src='img/no_results.jpg'/><br>";
    }

    rows.forEach(function(row){
      
      htmlString += "<table id='productList'><tr><td id='imageCell'>";
      htmlString += "<a href='"+ row.url + "'><img class='image' id='productImage' src='"+ row.imageUrl + "'/></a>";
      htmlString += "</td><td id='productDetails'><div id='title'> "+ row.title + " </div>";
      htmlString += "<hr>Price:&nbsp$"+ row.price + "<br>";
      htmlString += "ASIN: "+ row.asin + "<br><br>";
      
      if (req.query.showReviewButton == "true") {
          //I (James) added in this form that appears as a button which the user can click to leave review. It passes the item ASIN.
          //Josh swapped out "row.asin.slice(0,-2)" for "row.asin" as the former was somehow chopping off the end of the asin.
          htmlString += "<form id='goReview' action='/review'><input type='hidden' id='asin' name='asin' value='" + row.asin + "'/><button id='reviewButton' class='btn btn-primary'>See Reviews</button></form>";
      }
      
      htmlString += "</td></tr></table>";
    });
    
    let jsonString = {
      "string" : htmlString,
    };
    
    res.send(jsonString);

  });
  
});//api/getFavorites

//////////////// Login Page code //////////////////

// use req.session.userLogged to find the currently logged in user
// the middleware isAuthenticated (i.e. app.get("/page", isAuthenticated, function(req, res){}); ) can check if a user is logged in

//NEW ROUTE STARTER BY JOSH - FEEL FREE TO DO WHATEVER YOU LIKE WITH IT
app.get("/profile", function(req, res) {
  
  let username = 1; //need to replace this with whatever req.session value will give the current username logged in
  let sql = "SELECT DISTINCT products_ASIN FROM reviews WHERE users_userID = ?";
  let sqlParams = [username]; 
  
  console.log("username: " + username);

  pool.query(sql, sqlParams,function(err, rows, fields) {
  
    if (err) throw err;
    console.log(rows);
    if (rows == "") {
    
      //Some other value may work.
      res.render("profile", {"rows" : rows});
    
    }
  
    else {
    
      res.render("profile", {"rows" : rows});
    
    }
  
  });
  
});

//when the user attempts to log in
app.get("/login", function(req, res){
    //uncomment the following three lines to have the user be auto logged in, to save time while testing
    //req.session.userLogged = "test";
    //res.redirect("/");
    //return;
  
    res.render("login");
});


app.post("/loginPost", async function(req, res){
    console.log(req.session.authenticated);
    let username = req.body.username;
    let password = req.body.password;
    
    let result = await checkUsername(username);
    console.dir(result);
    let hashedPwd = "";
    
    if (result.length > 0){
        hashedPwd = result[0].password;
    }else{
        res.render("login", {"loginError":true});
        return;
    }
    
    let passwordMatch = await checkPassword(password, hashedPwd);
    console.log("passwordMatch:" + passwordMatch);
    
    if (passwordMatch) {
        req.session.userLogged = username;
        req.session.save();
        //console.log(req.session.authenticated);
        
        console.log("User logged in is " + req.session.userLogged);
        console.log("Is authenticated is " + (typeof(req.session.userLogged) != "undefined"));
        
        res.redirect("/");
    }else{
        res.render("login", {"loginError":true});
    }
    //console.log(req.session.authenticated);
});

app.get("/signup", function(req, res){
    res.render("signup");
});

//to create new accounts
app.post("/makeNewAccount", async function(req, res){
    let username = req.body.username;
    let password = req.body.password;
    if(username == "" || password == ""){
        res.render("signup", {"emptyError":true});
        return;
    }
    let result = await checkUsername(username);
    console.dir(result);
    if (result.length > 0){
        res.render("signup", {"existsError":true});
        return;
    }
    
    let hashedPwd = await hashPassword(password);
    
    let sql = "INSERT INTO users (username, password) VALUES (?,?)";
    let sqlParams = [username, hashedPwd];
    
    pool.query(sql, sqlParams, function (err, rows, fields) {
        if (err) throw err;
        console.log(rows);
  });
  res.render("login", {"accountSuccess":true});
});

//destroy the current session if the user logs out    
app.get("/logout", function(req, res){
    req.session.destroy();
    res.redirect("/");
})

//verify that a username is in the database    
function checkUsername(username){
    let sql = "SELECT * FROM users WHERE username = ?";
    return new Promise(function(resolve, reject){
        pool.query(sql, [username], function (err, rows, fields){
            if (err) throw err;
            console.log("Rows found: " + rows.length);
            resolve(rows);
        });
    });
}

//check to see if any user is logged on 
function isAuthenticated(req, res, next) {
    if (typeof(req.session.userLogged) == "undefined"){
        res.redirect("/login");
    }else{
        next()
    }
}    

//check a passord against the hash received from the database
function checkPassword(password, hashedValue){
    return new Promise( function(resolve, reject){
        bcrypt.compare(password, hashedValue, function(err, result){
            console.log("Result: " + result);
            resolve(result);
        })
    })
}

//hash a password in order to add it to the database
function hashPassword(password){
    return new Promise(function(resolve, reject){
        bcrypt.hash(password, saltRounds, function(err, hash) {
            console.log("Hash: " + hash);
            resolve(hash);
        });
    })
}