//Outline of app

// 1. User enters a restaurant and navigates to site.
// 2. Foursquare offers the possible site ids for a checkin
// If there is a code for that location, it gives it to you,
// if not, it offers the submit form
// 3. User has the ability to get bathroom code or submit 
// to the database.
// 4.server fetches either the code from the DB, or adds it

var bathroomCodeLiberator = {};
var foursquareURL='';
var count = 0;
var tempdata;

CLIENT_ID = 'K1XIZWQXSX5LIFIC05MXQZURUUEVGPKUHVWD2QW1ZHIOCAEN';
CLIENT_SECRET = '4MWSP2BBIHHQI4CLL3QVO51KZF24KCALH4GGBJV3ACYN35YT';

var CLOUDANT_USERNAME="arntzy";
var CLOUDANT_DATABASE="bathroomcodes";
var CLOUDANT_KEY="lismitspecincestandeastr";
var CLOUDANT_PASSWORD="1qJD17wuNs0QOSNkfnJa1Iun";


var hash = btoa(CLOUDANT_KEY+":"+CLOUDANT_PASSWORD);

var saveRecord = function (data) {
  return $.ajax("https://"+CLOUDANT_USERNAME+".cloudant.com/"+CLOUDANT_DATABASE, {
    beforeSend: function (xhr) {
      xhr.setRequestHeader ("Authorization", "Basic "+hash); 
    },
    contentType: "application/json",
    type: "POST",
    data: JSON.stringify(data)
  });
};


var loadCode = function () {
  $.ajax("https://"+CLOUDANT_USERNAME+".cloudant.com/"+CLOUDANT_DATABASE+ "/_design/search/_search/venue_and_day?include_docs=true&q=day:" + bathroomCodeLiberator.day + " AND foursquare_venue_id:" + bathroomCodeLiberator.location.id + '&sort="date"', {
    beforeSend: function (xhr) {
      xhr.setRequestHeader ("Authorization", "Basic "+hash);
    },
    type: "GET"
  }).done(function (resp) {
    //console.log(resp);
    bathroomCodeLiberator.documents = JSON.parse(resp);
    console.log(bathroomCodeLiberator.documents);
    
    if (bathroomCodeLiberator.documents.rows.length){
      $('#suggestedCode').empty().toggle().append('<p>The code is: <code>' + bathroomCodeLiberator.documents.rows[bathroomCodeLiberator.documents.rows.length - 1].doc.code + '</code><p>');
      $('#suggestedCode').append("<button id='notrightbutton' class='btn btn-xs btn-danger'>Not Right?</button>");
      console.log(bathroomCodeLiberator.documents.rows[bathroomCodeLiberator.documents.rows.length - 1].doc.code);
      
      $('#notrightbutton').click(function(){
        $('#suggestedCode').empty().toggle();
        $('#bathboxContainer').toggle();
        $('#failMessage').empty().toggle().append("Please submit the correct code!");
      });

    }

    else {
      $('#failMessage').empty().toggle().append("No code found in database. Please submit one!");
      $('#bathboxContainer').toggle();
    }
  });
};


function getFourSquareVenues() {
	
	$.ajax({
		url: foursquareURL,     	
		datatype: 'jsonp',

		success: function(data){
			//console.log("got it");
			console.log(data);
      tempdata = data; 
      suggestNearbyLocations(data);
		},  
		error: function(err){
			console.log(err);
		}
	});
}

function suggestNearbyLocations (data) {    
 console.log(data);
 $('#suggestedLocation').empty();
 var possibleLocations = [];
 var closestLocations = [];
 
 for (var i = 0; i < data.response.venues.length; i++) {
     possibleLocations.push(_.pick(data.response.venues[i], 'id', 'location', 'name'));
 }
 
 possibleLocations.sort(function (a, b) {
    if (a.location.distance > b.location.distance)
      return 1;
    if (a.location.distance < b.location.distance)
      return -1;
    return 0;
});

 if(possibleLocations[count]){
 $('#suggestedLocation').append('<p>Are you at ' + possibleLocations[count].name + '?<p>'); 
 
 bathroomCodeLiberator.location = possibleLocations[count]; 
 console.log(bathroomCodeLiberator.location);
 
 $('#buttonContainer').toggle();
}
 else $('#suggestedLocation').append("Can't suggest a location!");
}



function geoFindMe() {
  
  $('#loadingDiv').removeAttr("hidden");
  if (!navigator.geolocation){
    output.innerHTML = "<p>Geolocation is not supported by your browser</p>";
    return;
  }
  
  function success(position) {
    bathroomCodeLiberator.latitude  = position.coords.latitude;
    bathroomCodeLiberator.longitude = position.coords.longitude;
  	
    console.log(bathroomCodeLiberator.latitude);
  	console.log(bathroomCodeLiberator.longitude);
  	
    //add some sort of templating to make sure we have to wait for the load
    console.log("Latitude and longitude found.");
    console.log("Enabling the text field.");
    $('#loadingDiv').hide();
    $('input').removeAttr("disabled");
  }
  
  function error() {
    console.log("Unable to retrieve your location");
  }

  navigator.geolocation.getCurrentPosition(success, error);
}


function foursquareURLinit(){
    foursquareURL = '';
    foursquareURL += 'https://api.foursquare.com/v2/venues/search?';
    foursquareURL += 'client_id=' + CLIENT_ID;
    foursquareURL += '&client_secret=' + CLIENT_SECRET;
    foursquareURL += '&ll=' + bathroomCodeLiberator.latitude + ',' + bathroomCodeLiberator.longitude;
    foursquareURL += '&radius=100';
    foursquareURL += '&intent=checkin';
    foursquareURL += '&limit=20';
    foursquareURL += '&v=20140101';

}



function getMyDate(){
	bathroomCodeLiberator.date = moment().format('YYYYMMDD');
	bathroomCodeLiberator.day = moment().format('ddd');
  console.log(bathroomCodeLiberator.day);
  console.log(bathroomCodeLiberator.date);
}


$(function(){
	getMyDate();
	geoFindMe();


  $('#textbox').keypress(function(e){
    // e.preventDefault();
    if(e.keyCode == 13){ 
     var query = $('input').val();

     foursquareURLinit();
     foursquareURL += '&query='+ query; 

     console.log(foursquareURL);
     getFourSquareVenues(); 
     $('#textboxContainer').toggle();
   }
 });


$('#yesButton').click(function(){
	loadCode();
  
  $('#suggestedLocation').toggle();
  $('#buttonContainer').toggle();
  $('#textbox').toggle();
});


$('#noButton').click(function(){
   count++; 
   suggestNearbyLocations(tempdata);
  $('#buttonContainer').toggle();
});


$('#bathroom_code_box').keypress(function(e){
 if(e.keyCode == 13){ 

  var bathroomCodeData = {
      day: moment().format('ddd'),
      date: parseInt(moment().format('YYYYMMDD')),
      foursquare_venue_id: bathroomCodeLiberator.location.id, 
      name: bathroomCodeLiberator.location.name,
      code: $('#bathroom_code_box').val()
    };

    console.log(bathroomCodeData);

    var request = saveRecord(bathroomCodeData);

    request.done(function(resp){
      $('#suggestedCode').empty();
      $('#successMessage').empty().toggle().append("<strong>Thank You!</strong>");
      $('#bathboxContainer').toggle();
      $('#textbox').toggle();
      $('#failMessage').toggle();
    });

    request.fail(function(){
      $('#suggestedCode').empty();
      $('#failMessage').empty().toggle().append("<strong>Code Not Submitted!</strong>");
      console.log("failed to upload to cloudant");
    });
  }
});

});




