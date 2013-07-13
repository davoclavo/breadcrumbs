;(function($){


  var firebase = new Firebase("https://breadcrumbsapp.firebaseio.com/");


  var trailName = "hackathon";
  var trailNode = firebase.child("trails/" + trailName);

  var myselfID = randomHex(6);
  var myself = trailNode.child(myselfID);


  var friendsMarkers = {};


  var map = null;
  var marker = null;

  var initMap = function() {
    var pos = {
      lat: 19.386472899999998,
      lng: -99.1618527
    }
    map = new GMaps({
      div: '#map',
      lat: pos.lat,
      lng: pos.lng
    });
    marker = map.addMarker(pos)
    map.setZoom(22);
  }

  var updateClientMarker = function(clientId, clientPosition) {
    console.log("Updating my friend position ", clientId, clientPosition);
    var clientMarker = friendsMarkers[clientId];
    if (clientMarker) {
      var googlePosition = new google.maps.LatLng(clientPosition.lat, clientPosition.lng);
      clientMarker.setPosition(googlePosition);
    } else {
      clientMarker = map.addMarker(clientPosition);
      friendsMarkers[clientId] = clientMarker;
    }
  }

  var updateMyPosition = function() {
    navigator.geolocation.getCurrentPosition(function(geo){
      var pos = { lat: geo.coords.latitude, lng: geo.coords.longitude };

      myself.set(pos);


      marker.animatedMoveTo(pos.lat, pos.lng);

      setTimeout(updateMyPosition, 1000);

    }, function(error) {
      setTimeout(updateMyPosition, 1000);
    }, {timeout: 1000});
  }

  var drawClient = function(clientSnapshot) {
    var client = clientSnapshot.val();
    if (client) {
      var clientId = clientSnapshot.name();
      if (clientId != myselfID) {
        updateClientMarker(clientId, client);
      }
    }
  }

  var drawClients = function() {
    trailNode.on('child_added', drawClient);
    trailNode.on('child_changed', drawClient);
  }

  $(document).ready(function() {
    initMap();
    setTimeout(updateMyPosition, 1000);
    drawClients();
  })


})(jQuery);

