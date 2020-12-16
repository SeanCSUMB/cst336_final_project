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
    res.render("index", {"welcomeName": req.session.userLogged});
});

//starting server
app.listen(process.env.PORT, process.env.IP, function() {
    console.log("Express server is running...");
    
    
});

//////////////// Reviews code //////////////////

//Internal API...
app.get("/reviewAPI", async function(req, res) {
  
  //Set this to false to leave as many reviews as you like.
  let debugOff = false;
  
  //Debug
  console.log("Review API says user logged in is " + req.session.userLogged);
  console.log("Review API says is authenticated is " + (typeof(req.session.userLogged) != "undefined"));
  
  //If a user is logged in...
  if (typeof(req.session.userLogged) != "undefined") {
  
    //Debug
    console.log("Review API says " + req.query.id);
    console.log("Review API says " + req.query.asin);
    
    let id = req.query.id;
    let asin = req.param('asin');
    let username = req.query.username;
    
    //Get all of the reviews from this user.
    let sql = "SELECT * FROM reviews WHERE users_userID = (SELECT userID from users WHERE username = ?)";
    let params = [username];
    sql = mysql.format(sql, params);
    //Query the database.
    pool.query(sql, function(err, rows, fields) {
    
      //If there was an error, throw one.
      if (err) throw err;
      
      //If the select statement returned anything and debug mode is off...
      if (rows && debugOff) {
        
        //Log that the user already left a review.
        console.log("Already left review...");
        
      //End of if.
      }
      
      //Otherwise...
      else {
        
        //Log that the user attempted to leave a review.
        console.log("Attempted to leave review! Text is " + req.query.itemReview);
  
        //Insert the review information into the reviews table.
        sql = "INSERT INTO reviews (idreviews, reviewText, products_productID, users_userID, products_ASIN, rating) VALUES (DEFAULT, ?, ?, (SELECT userID from users WHERE users.username = ?), ?, ?)";
        params = [req.query.itemReview, id, username, asin, req.query.rating];
        sql = mysql.format(sql, params);
        //Query the database.
        pool.query(sql, function(err, rows) {
    
          //If there is an error, throw one.
          if (err) throw err;
          res.send("OK");
    
        //End of query.
        });
        
      //End of else.  
      }
    
    //End of query.
    });
  
  //End of if.
  }
  
  else {
    
    res.send("NotOK");
    
  }

//End of this API.
});

//Route for the page that contains all reviewed products.
app.get("/allReviews", isAuthenticated, function(req, res) {
  
  //Select all distinct products ASINs from the reviews table.
  let sql = "SELECT DISTINCT products_ASIN FROM reviews";

  //Query the database.
  pool.query(sql, function(err, rows, fields) {
  
    //Throw an error if there is an error.
    if (err) throw err;
    //Print the returned rows to the console.
    console.log(rows);
    //Then render the allReviews page with the returned rows.
    res.render("allReviews", {"rows" : rows});
  
  //End of pool.query
  });

//End of route.
});

//Route for an individual product's review page.
app.get('/review', function (req, res) {
  
  //Debug.
  console.log("User logged in is " + req.session.userLogged);
  console.log("Is authenticated is " + (typeof(req.session.userLogged) != "undefined"));
  
  //Set id and ASIN.
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
  
  //If the user is trying to access a page for a product that does not exist (which should never happen)...
  if (asin == "") {
     
      //Redirect them.
      res.redirect("allReviews");
     
  }
  
  //Debug
  console.log("id is " + id + " and asin is " + asin);
  
  //Select everything from the users joined with the reviews of the products with this ASIN.
  let sql = "SELECT * FROM users RIGHT OUTER JOIN reviews ON users.userID = reviews.users_userID WHERE reviews.products_ASIN = ?";
  let params = [asin];
  sql = mysql.format(sql, params);
  //Query the database.
  pool.query(sql, function(err, rows, fields) {
    
    //If there is an error, throw one.
    if (err) throw err;
    //Log the returned rows.
    console.log(rows);
    //Log whether something was returned or not.
    console.log(Object.keys(rows).length === 0);
    
    //If there are no reviews...
    if (Object.keys(rows).length === 0) {
      
      //Render the review page with a rows that does nothing and everything else as appropriate.
      res.render("review", {"rows" : "It looks like there are no reviews for this product yet.", "id" : id, "asin" : asin, "username" : req.session.userLogged});
      
    //End of if.
    }
    
    //Otherwise (if there are reviews)...
    else {
      
      //Render the review page with all of those reviews and everything else as appropriate.
      res.render("review", {"rows" : rows, "id" : id, "asin" : asin, "username" : req.session.userLogged});
     
    //End of else. 
    }
    
  //End of query.
  });
    
//End of route.
});

//Route for when a user leaves a new review.
/*app.get("/newReview", function(req, res) {
  
  //Set this to false to leave as many reviews as you like.
  let debugOff = false;
  
  //Debug
  console.log("User logged in is " + req.session.userLogged);
  console.log("Is authenticated is " + (typeof(req.session.userLogged) != "undefined"));
  
  //If a user is logged in...
  if (typeof(req.session.userLogged) != "undefined") {
  
    //Debug
    console.log(req.query.id);
    console.log(req.query.asin);
    
    //Set id, asin, and username.
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
  
    //If the user is reviewing a product with no ASIN (which should never happen)...
    if (asin == "") {
     
      //Redirect them.
      res.redirect("allReviews");
     
    }
    
    let username = "";
    if (req.query.username) {
     
        username = req.query.username;
     
    }
   
    //If there is no username (which should never happen)...
    if (username == "") {
     
        //Put in a dummy value.
        username = "johndoe";
     
    }
    
    //Get all of the reviews from this user.
    let sql = "SELECT * FROM reviews WHERE users_userID = (SELECT userID from users WHERE username = '" + username + "')";
    //Query the database.
    pool.query(sql, function(err, rows, fields) {
    
      //If there was an error, throw one.
      if (err) throw err;
      
      //If the select statement returned anything and debug mode is off...
      if (rows && debugOff) {
        
        //Log that the user already left a review.
        console.log("Already left review...");
        
      //End of if.
      }
      
      //Otherwise...
      else {
        
        //Log that the user attempted to leave a review.
        console.log("Attempted to leave review! Text is " + req.query.itemReview);
  
        //Insert the review information into the reviews table.
        sql = "INSERT INTO reviews (idreviews, helpfulVotes, unhelpfulVotes, reviewText, products_productID, users_userID, products_ASIN, rating) VALUES (DEFAULT, 0, 0, '" + req.query.itemReview + "', " + id + ", (SELECT userID from users WHERE users.username = '" + username + "'), '" + asin + "', " + req.query.rating + ")";
        //Query the database.
        pool.query(sql, function(err) {
    
          //If there is an error, throw one.
          if (err) throw err;
    
        //End of query.
        });
        
      //End of else.  
      }
      
      //Redirect the user.
      res.redirect("/review?asin=" + asin);
    
    //End of query.
    });
  
  //End of if.
  }
  
  //Otherwise (that is, if there is no user logged in)...
  else {
    
    //Rebder the login page.
    res.render("login");
    
  //End of else.
  }
  
//End of route.
});*/

//Can be removed once the other version is double checked.
/*app.get("/helpful", function(req, res) {
  
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
    
    asin = req.param('asin');
    
  }
  
  if (asin == "") {
     
      //Don't actually return, the page will be stuck in limbo. Just render the previous page.
      return;
     
  }
  
  console.log("Before main process...");
  
  //Debugging...
  if (typeof(req.session.userLogged) != "undefined" && !req.session.votedItems.includes(id)) {
    
    console.log("In if...");
    let sql = "UPDATE reviews SET helpfulVotes = helpfulVotes + 1 WHERE reviews.idreviews = " + id;
    pool.query(sql, function(err) {
    
      if (err) throw err;
    
    });
    
    req.session.votedItems.push(id);
    
  }
  
  res.redirect("/review?asin=" + asin);
  
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
    
    asin = req.param('asin');
    
  }
  
  if (asin == "") {
     
      //Don't actually return, the page will be stuck in limbo. Just render the previous page.
      return;
     
  }
  
  if (typeof(req.session.userLogged) != "undefined" && !req.session.votedItems.includes(id)) {
    
    let sql = "UPDATE reviews SET unhelpfulVotes = unhelpfulVotes + 1 WHERE reviews.idreviews = " + id;
    pool.query(sql, function(err) {
    
      if (err) throw err;
    
    });
    
    req.session.votedItems.push(id);
    
    res.redirect("/review?asin=" + asin);
  
  }
  
  else {
    
    res.redirect("/review?asin=" + asin);
    //res.render("login");
    
  }
  
});*/

//Internal API...
/*app.get("/voteapi", async function(req, res) {
  
  //A vairable for the SQL.
  let sql;
  
  //Switch on whether the user voted helpful or unhelpful.
  switch (req.query.vote) {
    
    //If they voted helpful...
    case "helpful":
      
      //Switch on whether they are adding or removing their vote...
      switch (req.query.action) {
        
        //If they are adding one...
        case "add":
          
          //Update the SQL accordingly.
          sql = "UPDATE reviews SET helpfulVotes = helpfulVotes + 1 WHERE reviews.idreviews = " + req.query.id;
          //And break.
          break;
          
        //If they are removing one...
        case "remove":
          
          //Update the SQL accordingly.
          sql = "UPDATE reviews SET helpfulVotes = helpfulVotes - 1 WHERE reviews.idreviews = " + req.query.id;
          //And break.
          break;
      
      //End of switch.
      }
      
      //And break.
      break;
      
    //If they voted unhelpful...
    case "unhelpful":
      
      //Switch on whether they are adding or removing their vote...
      switch (req.query.action) {
        
        //If they are adding one...
        case "add":
          
          //Update the SQL accordingly.
          sql = "UPDATE reviews SET unhelpfulVotes = unhelpfulVotes + 1 WHERE reviews.idreviews = " + req.query.id;
          //And break.
          break;
          
        //If they are removing one...
        case "remove":
          
          //Update the SQL accordingly.
          sql = "UPDATE reviews SET unhelpfulVotes = unhelpfulVotes - 1 WHERE reviews.idreviews = " + req.query.id;
          //And break.
          break;
      
      //End of switch.
      }
      
      //And break.
      break;
      
  //End of switch.
  }
  
  //Query the database.
  pool.query(sql, function (err, rows, fields) {
    
    //If there is an error, throw one.
    if (err) throw err;
    //Send the affected rows back as a string.
    res.send(rows.affectedRows.toString());
    
  //End of query.
  });

//End of this API.
});*/

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
app.get("/profile", isAuthenticated, async function(req, res) {
  
  let username = req.session.userLogged; //need to replace this with whatever req.session value will give the current username logged in
  
  let idResult = await checkUsername(username);
  console.dir(idResult);
  let userId = idResult[0].userID;
  
  let sql = "SELECT DISTINCT products_ASIN FROM reviews WHERE users_userID = ?";
  let sqlParams = [userId]; 
  
  console.log("username: " + username);

  pool.query(sql, sqlParams,function(err, rows, fields) {
  
    if (err) throw err;
    console.log(rows);
    if (rows == "") {
    
      //Some other value may work.
      res.render("profile", {"rows" : rows, "currentUsername": username});
    
    }
  
    else {
    
      res.render("profile", {"rows" : rows, "currentUsername": username});
    
    }
  
  });
  
});

//when the user attempts to log in
app.get("/login", function(req, res){
    //uncomment the following three lines to have the user be auto logged in, to save time while testing
    //req.session.userLogged = "admin";
    //res.redirect("/");
    //return;
  
    res.render("login");
});

//you shoud not be able to access this page directly, so it redirects you back to the home page
app.get("/passResult", function(req, res){
    res.redirect("/");
});

//when the user submits the form to log in
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
        req.session.votedItems = [];
        
        console.log("User logged in is " + req.session.userLogged);
        console.log("Is authenticated is " + (typeof(req.session.userLogged) != "undefined"));
        
        res.redirect("/");
    }else{
        res.render("login", {"loginError":true});
    }
});

app.get("/signup", function(req, res){
    res.render("signup");
});

//to create new accounts
app.post("/makeNewAccount", async function(req, res){
    let username = req.body.username;
    let password = req.body.password;
    let retypePassword = req.body.retypePassword;
    
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
    
    if (password != retypePassword){
        res.render("signup", {"retypeError":true});
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

//to change the current user's password
app.post("/changePassword", async function(req, res){
    let oldPass = req.body.currentPassword;
    let newPass = req.body.newPassword;
    let newPass2 = req.body.retypeNewPassword;
    let username = req.session.userLogged
    
    if(oldPass == "" || newPass == "" || newPass2 == ""){
      //not all fields are filled in
        res.render("passResult", {"emptyError": true});
        return;
    }
    let result = await checkUsername(username);
    console.dir(result);
    if (result.length <= 0){
      //the currently logged in user is not in the datbase
        res.render("passResult", {"notExistsError":true});
        return;
    }
    let hashedPwd = result[0].password;
    let passwordMatch = await checkPassword(oldPass, hashedPwd);
    console.log("passwordMatch:" + passwordMatch);
    
    if (!passwordMatch) {
      //current password does not match the one on the database
      res.render("passResult", {"oldError":true});
      return;
    }
    
    if (newPass != newPass2){
      //password and retype password do not match
        res.render("signup", {"retypeError":true});
        return;
    }
    
    let newHashedPwd = await hashPassword(newPass);
    
    let sql = "UPDATE users SET password = ? WHERE username = ?";
    let sqlParams = [newHashedPwd, username];
    
    pool.query(sql, sqlParams, function (err, rows, fields) {
        if (err) throw err;
        console.log(rows);
  });
  res.render("passResult", {"changeSuccess":true});
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