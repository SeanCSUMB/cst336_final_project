/* global $ */
/* global fetch */
 
$(document).ready(function(){
    
    $(document).on('keypress',function(e) {
        
        if(e.which == 13 && $("#searchBar").val() != "") {
            $("#searchButton").click();
        }
        
        if(e.which == 13 && $("#itemReview").val() != "") {
            $("#reviewSubmit").click();
        }
        
    });
    
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
    
    //When any .btn-secondary is clicked (which only exists below the review form)...
    $(".btn-secondary").on("click", async function() {
        
        if ($("#itemReview").val().length < 3) {
            $("#itemReview").css("border", "1px solid red");
        } else {
        
            //Get the form data.
            let params = $('form').serialize();
            //Declare the variable in advance.
            let response;
            
            //As long as there is data...
            if (params) {
                
                //Let the url be for an internal API, with the parameters passed.
                let url = `/reviewAPI?` + params;
                //Await the response.
                response = await fetch(url);
            
            //End of if.
            }
            
            //Since no rows are returned, the API returns OK if everything went smoothely. If the response is not "OK"...
            if (response == "NotOK") {
                
                //Send the user to the login page (not being logged in is the only way to get a non-OK response)
                window.location.assign("/login");
            
            //End of if.
            } else {
                window.location.reload(false); 
            }
        
        }
    //End of click event.    
    });

});