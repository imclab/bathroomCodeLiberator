//Outline of app

// 1. User enters a restaurant and navigates to site.
// 2. Foursquare offers the possible site ids for a checkin
// If there is a code for that location, it gives it to you,
// if not, it offers the submit form
// 3. User has the ability to get bathroom code or submit 
// to the database.
// 4.server fetches either the code from the DB, or adds it

//foursquare shit:

// https://api.foursquare.com/v2/venues/search?client_id=K1XIZWQXSX5LIFIC05MXQZURUUEVGPKUHVWD2QW1ZHIOCAEN%20&client_secret=4MWSP2BBIHHQI4CLL3QVO51KZF24KCALH4GGBJV3ACYN35YT%20&ll=40.7275651,%20-73.9471162&v=20140418


//Database: 

// Foursquare Venue id     date 	  	code  

//Possible API calls: 
// Where am I? 
// https://api.foursquare.com/v2/venues/search

// What are this venue's details?
// https://api.foursquare.com/v2/venues/VENUE_ID
var bathroomCodeLiberator = {};
var foursquareURL='';

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
  $.ajax("https://"+CLOUDANT_USERNAME+".cloudant.com/"+CLOUDANT_DATABASE+"/_design/search/_search/venue_and_day?include_docs=true&q=day:" + bathroomCodeLiberator.day + "&foursquare_venue_id:" + bathroomCodeLiberator.location.id + '&sort="date"', {
    beforeSend: function (xhr) {
      xhr.setRequestHeader ("Authorization", "Basic "+hash);
    },
    type: "GET"
  }).done(function (resp) {
    //console.log(resp);
    bathroomCodeLiberator.documents = JSON.parse(resp);
    console.log(bathroomCodeLiberator.documents);
    
    $('#suggestedCode').append('<p>The most recent code is: ' + bathroomCodeLiberator.documents.rows[bathroomCodeLiberator.documents.rows.length - 1].doc.code + '<p>');

    console.log("The most recent code is: " );
    console.log(bathroomCodeLiberator.documents.rows[bathroomCodeLiberator.documents.rows.length - 1].doc.code);

    // // Now that the notes are sorted, render them using underscore templates
    // sorted.forEach(function (row) {
    //   var compiledTmpl = noteTemplate(row.doc);
    //   $('#notes').append(compiledTmpl)  
  });
};


function getFourSquareVenues() {
	
	$.ajax({
		url: foursquareURL,     	
		datatype: 'jsonp',

		success: function(data){
			//console.log("got it");
			console.log(data);
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

 $('#suggestedLocation').append('<p>Are you at ' + possibleLocations[0].name + '?<p>'); 
 
 bathroomCodeLiberator.location = possibleLocations[0]; 
 console.log(bathroomCodeLiberator.location);

 //console.log(possibleLocations);
 // console.log(closestLocations);


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
  	
    // var img = new Image();
    // img.src = "http://maps.googleapis.com/maps/api/staticmap?center=" + bathroomCodeLiberator.latitude + "," + bathroomCodeLiberator.longitude + "&zoom=18&size=300x300&sensor=false";


    $('#suggestedLocation').append(bathroomCodeLiberator.latitude + ',');
    $('#suggestedLocation').append(bathroomCodeLiberator.longitude);
    // $('#suggestedLocation').append(img);

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
    // foursquareURL += 'https://api.foursquare.com/v2/venues/suggestcompletion?';
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


$('#getLocationButton').click(function(){
  console.log($('input').val());
  var query = $('input').val();

  foursquareURLinit();
  foursquareURL += '&query='+ query; 
  
  console.log(foursquareURL);
  getFourSquareVenues();
});

$('#getCodeButton').click(function(){
	console.log("button clicked");
	loadCode();
  // getBathroomCode();
});

$('#submitCodeButton').click(function(){
  console.log("code being submitted");

  var bathroomCodeData = {
    day: moment().format('ddd'),
    //date: 20140502,
    date: parseInt(moment().format('YYYYMMDD')),
    //fix the names to not be confusing
    //_id: bathroomCodeLiberator.location.id,
    foursquare_venue_id: bathroomCodeLiberator.location.id, 
    name: bathroomCodeLiberator.location.name,
    code: $('#bathroom_code_box').val()
  };

  console.log(bathroomCodeData);

  var request = saveRecord(bathroomCodeData);

  request.done(function(resp){
    console.log("successful upload");

  });

  request.fail(function(){
    console.log("failed to upload to cloudant");
  });

});

});




