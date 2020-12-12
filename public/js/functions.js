/* global $ */
/* global fetch */
 
$(document).ready(function(){
    
    async function updateDatabase(action, imageUrl, keyword, title, price, url, asin) {
        let myUrl = `/api/updateDatabase?action=${action}&imageUrl=${imageUrl}&keyword=${keyword}&title=${title}&price=${price}&url=${url}&asin=${asin}`;
        await fetch(myUrl);
    }
    
    //Populate all results when results page is loaded (page load clicks the resultsLoader button)
    $("#resultsLoader").on("click", async function(){
        let keyword = $("#resultsLoader").attr('name');
        
        let response = await  fetch(`/api/getItems?action=keyword&keyword=${keyword}&showReviewButton=true`);
        let data = await response.json();
        let htmlString = data.string;
        $("#resultscontainer").append(htmlString);
        
    });
    
    //Populate all results when results page is loaded (page load clicks the resultsLoader button)
    $("#asin").on("click", async function(){
        let asin = $("#asin").val();
        
        let response = await  fetch(`/api/getItems?action=asin&asin=${asin}&showReviewButton=false`);
        let data = await response.json();
        let htmlString = data.string;
        $("#reviewProductListing").append(htmlString);
        
    });
    
    //Used to list out all of the previously reviewed products.
    $("#productsLoader").on("click", async function() {
        
        let items = document.getElementsByClassName('listing');
        let containers = document.getElementsByClassName('listingContainer');
        console.log("Length: " + items.length);
        for (var i = 0; i < items.length; i++) {
        
            items[i].click();
            let asin = items[i].value;
        
            let response = await  fetch(`/api/getItems?action=asin&asin=${asin}&showReviewButton=true`);
            let data = await response.json();
            let htmlString = data.string;
            containers[i].innerHTML = htmlString;
            console.log(items[i]);
        
        } 
        
    });

});


