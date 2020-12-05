const express = require("express")
const app = express();
const pool = require("./dbPool.js");
const fetch = require("node-fetch");
const session = require('express-session');
const bcrypt = require('bcrypt');
const mysql = require('mysql');

app.set("view engine", "ejs");
app.use(express.static("public"));

app.use(session({
    secret: "top secret!",
    resave: true,
    saveUninitialized: true
}));

let productArray = [];

//routes
app.get("/", async function(req, res) {
  
    res.render("index");
});

//TODO:
//This area of the reviews should be mostly fine, but at the moment all that the reviews page displays is the title of the item.
app.get('/review', function (req, res) {
  
  let title = "";
  if (req.query.title) {
     
      title = req.query.title;
     
  }
   
  if (title == "") {
     
      //or other dummy value
      title = "Could not find title";
     
  }
  
  let sql = "SELECT * FROM reviews WHERE reviews.products_productID IN (SELECT id FROM products WHERE products.title = '" + title + "')";
  pool.query(sql, function(err, rows, fields) {
    
    if (err) throw err;
    console.log(rows);
    if (rows == "") {
      
      res.render("review", {"rows" : "It looks like there are no reviews for this product yet.", "title" : title});
      
    }
    
    else {
      
      res.render("review", {"rows" : rows, "title" : title});
      
    }
    
  });
  
  //displays title
  /*let title = "";
  if (req.query.title) {
     
      title = req.query.title;
     
  }
   
  if (title == "") {
     
      //or other dummy value
      title = "Could not find title";
     
  }
  
  res.render("review", {"title" : title});*/
    
});

app.get("/search", async function(req, res) {
    let keyword = "";
    if (req.query.keyword) {
        keyword = req.query.keyword;
    }
    
    if (keyword == "") {
      keyword = "Other";
    }
    
    let keywordEncoded = encodeURIComponent(keyword.trim());
    
    let apiUrl = "https://amazon-product-reviews-keywords.p.rapidapi.com/product/search?keyword=" + req.query.classSelected + "%20" + keywordEncoded + "&category=aps&country=US";
    
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
      console.log("INDEX: " + i);
      try {
        sql = "INSERT IGNORE INTO products (asin, imageUrl, keyword, title, price, url) VALUES (?,?,?,?,?,?)";
        sqlParams = [data.products[i].asin, data.products[i].thumbnail, keyword, data.products[i].title, data.products[i].price.current_price, data.products[i].url];
        pool.query(sql, sqlParams, function (err, rows, fields) {
          if (err) throw err;
          console.log(rows);
        });
      }
      catch(err) {
        console.error(err);
      }
    }
    
    res.render("results", {"keyword":keyword});
}); 

//this whole function needs to be redirected to a different database for user data
app.get("/api/updateFavorite", function(req, res){ 
  let sql;
  let sqlParams;
  switch (req.query.action) {
    case "favorite": sql = "UPDATE products SET favorite = 1 WHERE asin = ?";
                sqlParams = [req.query.asin];
                break;
    case "unfavorite": sql = "UPDATE products SET favorite = 0 WHERE asin = ?";
                sqlParams = [req.query.asin];
                break;
  }//switch
  pool.query(sql, sqlParams, function (err, rows, fields) {
    if (err) throw err;
    console.log(rows.affectedRows);
  });
    
});//api/updateFavorite

app.get("/api/checkFavorite", function(req, res){ 
  let sql;
  let sqlParams;
  sql = "SELECT favorite FROM products WHERE asin = ?";
  sqlParams = [req.query.asin];
  pool.query(sql, sqlParams, function (err, rows, fields) {
    if (err) throw err;
    console.log("ROWS: " + rows);
    res.send(rows[0].favorite);
  });
});//api/checkFavorite

app.get("/api/updateDatabase", function(req, res){
  let sql;
  let sqlParams;
  switch (req.query.action) {
    case "add": sql = "INSERT INTO products (imageUrl, keyword, title, price, url, asin) VALUES (?,?,?,?,?,?)";
                sqlParams = [req.query.imageUrl, req.query.keyword, req.query.title, req.query.price, req.query.url, req.query.asin];
                break;
    case "delete": sql = "DELETE FROM products WHERE imageUrl = ?";
                sqlParams = [req.query.imageUrl];
                break;
  }//switch
  pool.query(sql, sqlParams, function (err, rows, fields) {
    if (err) throw err;
    console.log(rows);
    res.send(rows.affectedRows.toString());
  });
});//api/updateDatabase

app.get("/getKeywords",  function(req, res) {
  let sql = "SELECT DISTINCT keyword FROM products WHERE favorite = ? ORDER BY keyword ";
  let sqlParams = ['1'];
  pool.query(sql, sqlParams, function (err, rows, fields) {
     if (err) throw err;
     console.log(rows);
     res.render("favorites", {"rows":rows});
  });  
});//getKeywords

//the main api for retrieving products from the database
app.get("/api/getItems", function(req, res){
  let sql;
  let sqlParams;
  switch (req.query.action) {
    case "asin": sql = "SELECT * FROM products WHERE asin = ? ORDER BY id DESC";
                sqlParams = [req.query.asin];
                break;
    case "favorite": sql = "SELECT * FROM products WHERE favorite = ? ORDER BY id DESC";
                sqlParams = ["1"];
                break;
    case "keywordAll": sql = "SELECT * FROM products WHERE keyword = ? ORDER BY id DESC";
            sqlParams = [req.query.keyword];
            break;
    case "keywordFav": sql = "SELECT * FROM products WHERE keyword = ? AND favorite = ? ORDER BY id DESC";
            sqlParams = [req.query.keyword, "1"];
            break;
  }
  pool.query(sql, sqlParams, function (err, rows, fields) {
    if (err) throw err;
    console.log(rows);
    res.send(rows);
  });
});//api/getFavorites


//starting server
app.listen(process.env.PORT, process.env.IP, function() {
    console.log("Express server is running...");
});