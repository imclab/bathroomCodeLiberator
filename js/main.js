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




function getFourSquareVenues() {
	
	$.ajax({
		url: foursquareURL,     	
		datatype: 'jsonp',

		success: function(data){
			//console.log("got it");
			//console.log(data);
      suggestNearbyLocations(data);
		},  
		error: function(err){
			console.log(err);
		}
	});
}

function suggestNearbyLocations (data) {    
 console.log(data);
 var possibleLocations = [];
 var closestLocations = []
 
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

 // for (var i = 0; i < possibleLocations.length; i++) {
 //  closestLocations.push(_.pick(possibleLocations[i].location.distance
 // }
 $('#suggestedLocation').append('<p>Are you at ' + possibleLocations[0].name + '?<p>'); 
 console.log(possibleLocations);
 // console.log(closestLocations);
}



function geoFindMe() {
  if (!navigator.geolocation){
    output.innerHTML = "<p>Geolocation is not supported by your browser</p>";
    return;
  }
  
  function success(position) {
    bathroomCodeLiberator.latitude  = position.coords.latitude;
    bathroomCodeLiberator.longitude = position.coords.longitude;
  	
    var img = new Image();
    img.src = "http://maps.googleapis.com/maps/api/staticmap?center=" + bathroomCodeLiberator.latitude + "," + bathroomCodeLiberator.longitude + "&zoom=18&size=300x300&sensor=false";


    $('#suggestedLocation').append(bathroomCodeLiberator.latitude);
    $('#suggestedLocation').append(bathroomCodeLiberator.longitude);
    $('#suggestedLocation').append(img);

    console.log(bathroomCodeLiberator.latitude);
  	console.log(bathroomCodeLiberator.longitude);
  	
  	foursquareURL += 'https://api.foursquare.com/v2/venues/search?';
  	foursquareURL += 'client_id=' + CLIENT_ID;
  	foursquareURL += '&client_secret=' + CLIENT_SECRET;
  	foursquareURL += '&ll=' + bathroomCodeLiberator.latitude + ',' + bathroomCodeLiberator.longitude;
  	foursquareURL += '&radius=20';
  	foursquareURL += '&intent=checkin';
  	foursquareURL += '&limit=20';
  	foursquareURL += '&v=20140101';

  	console.log(foursquareURL);
  	getFourSquareVenues();
  }
  
  function error() {
    console.log("Unable to retrieve your location");
  }

  navigator.geolocation.getCurrentPosition(success, error);
}






function getMyDate(){
	bathroomCodeLiberator.date = moment().format('YYYYMMDD');
	console.log(bathroomCodeLiberator.date);
}


$(function(){
	getMyDate();
	geoFindMe();

$('#getCodeButton').click(function(){
	console.log("button clicked");
	// getBathroomCode();
});


$('#submitCodeButton').click(function(){
	submitBathroomCode();
});

});



