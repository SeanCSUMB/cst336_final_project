/* global $ */
/* global fetch */
 
$(document).ready(function(){
    
    $(document).on('keypress',function(e) {
        if(e.which == 13) {
            $("#searchButton").click();
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
    
    $(".helpful").on("click", async function() {
        
        //This is where voting verification goes.
        let id = $(this).prev().attr("id");
        
        if ($(this).attr("src") == 'img/helpfulEmpty.png'){             
        
            $(this).attr("src","img/helpfulFull.png");
            let url = `/voteapi?vote=helpful&id=${id}&action=add`;
            console.log(url);
            await fetch(url);
        
            
        }
        
        else {
            
            $(this).attr("src","img/helpfulEmpty.png");
            let url = `/voteapi?vote=helpful&id=${id}&action=remove`;
            await fetch(url);
            
        }
        
        window.location.reload();
        
    });
    
    $(".unhelpful").on("click", async function() {
        
        //This is where voting verification goes.
        let id = $(this).prev().attr("id");
        
        if ($(this).attr("src") == 'img/unhelpfulEmpty.png'){             
        
            $(this).attr("src","img/unhelpfulFull.png");
            let url = `/voteapi?vote=unhelpful&id=${id}&action=add`;
            await fetch(url);
        
            
        }
        
        else {
            
            $(this).attr("src","img/unhelpfulEmpty.png");
            let url = `/voteapi?vote=unhelpful&id=${id}&action=remove`;
            await fetch(url);
            
        }
        
        window.location.reload();
        
    });
    
    $(".btn-secondary").on("click", async function() {
        
        let params = $('form').serialize();
        let response;
        
        if (params) {
            
            let url = `/reviewAPI?` + params;
            response = await fetch(url);
            
        }
        
        if (response != "OK") {
            
            window.location.assign("/login");
            
        }
        
        else {
            
            //Does not do what I want. The most recently left review does not get shown.
            window.location.reload(true);
            
        }
        
    });

});


