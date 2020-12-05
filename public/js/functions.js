/* global $ */
/* global fetch */
 
$(document).ready(function(){
    
    //Update the database if a favorite icon is clicked
    $(document).on('click',".favoriteIcon",function() {
    let asin = $(this).attr("id");

        if ($(this).attr("src") == "img/favorite.png") {
            $(this).attr("src", "img/favorite_on.png");
            updateFavorite("favorite", asin);
        }
        else {
            $(this).attr("src", "img/favorite.png");
            updateFavorite("unfavorite", asin);
        }
        
    });
    
    $("#classSelection").on("change", function() {
        
        let myClass = $("#classSelection").val();
        $("#classSelected").val(myClass);
        
        console.log("CLASS SELECTED: " + myClass + " - stored " + $("#classSelected").val());
    });
    
    $(".favoriteIcon").on("click", function() {
        
        let asin = $(this).attr("id");

        if ($(this).attr("src") == "img/favorite.png") {
            $(this).attr("src", "img/favorite_on.png");
            updateFavorite("favorite", asin);
        }
        else {
            $(this).attr("src", "img/favorite.png");
            updateFavorite("unfavorite", asin);
        }
    });
    
    async function updateFavorite(action, asin) {
        let url = `/api/updateFavorite?action=${action}&asin=${asin}`;
        await fetch(url);
    }
    
    async function updateDatabase(action, imageUrl, keyword, title, price, url, asin) {
        let myUrl = `/api/updateDatabase?action=${action}&imageUrl=${imageUrl}&keyword=${keyword}&title=${title}&price=${price}&url=${url}&asin=${asin}`;
        await fetch(myUrl);
    }
    
    //Populate all favorites when favorites page is loaded (page load clicks the keywordSelected button)
    $("#keywordSelected").on("click", async function(){
        let response = await  fetch(`/api/getItems?action=favorite`);
        let data = await response.json();
     
        $("#favorites").html("");
        let htmlString = "";
        let nextString = "";
    
        data.forEach(function(row){
            
           nextString = getProductTable(row).toString();
           htmlString += nextString;
        });

        $("#favorites").append(htmlString);
    });
    
    //Populate all results when results page is loaded (page load clicks the resultsLoader button)
    $("#resultsLoader").on("click", async function(){
        //let keyword =  $(this).html().trim();
        let keyword = $("#resultsLoader").attr('name');
        
        let response = await  fetch(`/api/getItems?action=keywordAll&keyword=${keyword}`);
        let data = await response.json();
     
        $("#resultscontainer").html("");
        let htmlString = "";
        let nextString = "";
        
        if (data.length == 0) { 
            htmlString = "<br><img class='noResultsImage' src='img/no_results.jpg'/><br>";
        }
    
        data.forEach(function(row){
            
           nextString = getProductTable(row);
           htmlString += nextString;
        });

        $("#resultscontainer").append(htmlString);
    });
    
    //Needs to be integrated with whichever database we are using, and cannot be tested.
    $("#reviewsLoader").on("click", function() {
    
       // let response = all reviews of item from a route like /api/getReviews
       // let data = await response.json();
       // $("#reviewsContainer").html("");
       // let htmlString = "";
       // data.forEach(function(row) {
           
            //htmlString += row.{username field goes here}<br>;
            //htmlString += row.{review text field goes here + "<br>";
            //let favoritePercent = row.{helpful votes field}/(row.{helpful votes} + row.{unhelpful votes});
            //htmlString += favoritePercent + " of adventurers found this review helpful";
            //Insert code for vote helpful/unhelpful
            
       //});
        
    });
    
    //filter favorites by keyword when one is clicked
    $(".keywordLink").on("click", async function(){

        let keyword =  $(this).html().trim();
        $("#keywordSelected").val(keyword);
        let response = await  fetch(`/api/getItems?action=keywordFav&keyword=${keyword}`);
        let data = await response.json();
     
        $("#favorites").html("");
        let htmlString = "";
        let nextString = "";
    
        data.forEach(function(row){
            
           nextString = getProductTable(row);
           htmlString += nextString;
        });
        
        $("#favorites").append(htmlString);
    
    });//keywordLink
    

    
    //convert a row into a unified product listing HTML string
    function getProductTable(row) {
        
        let htmlString = "";
        htmlString += "<table id='productList'><tr><td id='imageCell'>";
        if (row.favorite == "1")
            htmlString += "<img class='favoriteIcon' src='img/favorite_on.png' id ='"+ row.asin + "' width='30'>";
        else if (row.favorite =="0")
            htmlString += "<img class='favoriteIcon' src='img/favorite.png' id ='"+ row.asin + "' width='30'>";
        htmlString += "<a href='"+ row.url + "'><img class='image' id='productImage' src='"+ row.imageUrl + "'/></a>";
        htmlString += "</td><td id='productDetails'><div id='title'> "+ row.title + " </div>";
        htmlString += "<hr>Price:&nbsp$"+ row.price + "<br>";
        htmlString += "ASIN: "+ row.asin + "<br><br></td></tr></table>";
        
        //I (James) added in this form that appears as a button which the user can click to leave review. It only passes the name of the item.
        htmlString += "<br><form id='goReview' action='/review'><input type='hidden' id='title' name='title' value='" + row.title + "'/><button>Leave Review</button></form>"
        
        return htmlString;
    }

});


