;(function($){


  var firebase = new Firebase("https://breadcrumbsapp.firebaseio.com/");


  var channelName = "hackathon";
  var channelNode = firebase.child("channels/" + channelName);

  var clientID = randomHex(6);
  var myself = channelNode.child(clientID);


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

  $(document).ready(function() {
    initMap();
    setTimeout(updateMyPosition, 1000);
  })


})(jQuery);

