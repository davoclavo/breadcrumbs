;(function($){


  var firebase = new Firebase("https://breadcrumbsapp.firebaseio.com/");


  var trailName = "hackathon";
  var trailNode = firebase.child("trails/" + trailName);

  var myselfID = randomHex(6);
  var myself = trailNode.child(myselfID);


  var friendsAvatars = {};

  var map = null;

  var initMap = function() {
    var info = {
      lat: 19.386472899999998,
      lng: -99.1618527,
      id:    myselfID,
      email: myselfID + '@breadcrumbs',
      status: "OMW"
    }
    map = new GMaps({
      div: '#map',
      lat: info.lat,
      lng: info.lng
    });

    friendsAvatars[myselfID] = createAvatar(info)

    map.setZoom(18);
  }


  var createAvatar = function(info) {
    var marker = map.addMarker({lat: info.lat, lng: info.lng})
    marker.setVisible(false);
    var overlay = map.drawOverlay({
      lat: info.lat,
      lng: info.lng,
      content: "<div id='"+info.email+"' class='guy'><img class='avatar' src='http://avatars.io/email/"+info.email+"'/><h6 class='status'>"+info.status+"</h6></div>"
    })
    var avatar = {
      marker: marker,
      overlay: overlay,
      info: info
    }
    return avatar;
  }

  var redrawAvatar = function(avatar) {
    return function(googlePos) {
      var info = avatar.info;
      var content = "<div id='"+info.email+"' class='guy'><img class='avatar' src='http://avatars.io/email/"+info.email+"'/><h6 class='status'>"+info.status+"</h6></div>";
      avatar.overlay.setMap(null);
      avatar.overlay = map.drawOverlay({
        lat: googlePos.lat(),
        lng: googlePos.lng(),
        content: content
      })
    }
  }

  var updateClientAvatar = function(clientId, clientInfo) {
    var friendAvatar = friendsAvatars[clientId];
    if (friendAvatar) {

      friendAvatar.marker.animatedMoveTo(clientInfo.lat, clientInfo.lng, redrawAvatar(friendAvatar))

    } else {

      friendAvatar = createAvatar(clientInfo);
      friendsAvatars[clientId] = friendAvatar;

    }
  }


  var updateMyPosition = function() {
    navigator.geolocation.getCurrentPosition(function(geo){

      var avatar = friendsAvatars[myselfID];

      // si la distancia es mayor de 0.0001 actualizamos
      var distance = latLngDistance(avatar.info, {lat: geo.coords.latitude, lng: geo.coords.longitude});

      if (distance > 0.0001) {

        avatar.info.lat = geo.coords.latitude;
        avatar.info.lng = geo.coords.longitude;
        myself.set(avatar.info);

      }

      setTimeout(updateMyPosition, 1000);

    }, function(error) {
      setTimeout(updateMyPosition, 1000);
    }, {timeout: 1000});
  }

  var drawClient = function(clientSnapshot) {
    var client = clientSnapshot.val();
    if (client) {
      var clientId = clientSnapshot.name();
      updateClientAvatar(clientId, client);
    }
  }

  var removeClient = function(clientSnapshot) {
    var clientId = clientSnapshot.name();
    if (clientId == myselfID) { return; }
    var friendAvatar = friendsAvatars[clientId];
    if(friendAvatar) {
      friendAvatar.marker.setMap(null);
      friendAvatar.overlay.setMap(null);
      delete friendsAvatars[clientId];
    }
  }

  var drawClients = function() {
    trailNode.on('child_added', drawClient);
    trailNode.on('child_changed', drawClient);
    trailNode.on('child_removed', removeClient);
  }

  $(document).ready(function() {
    initMap();
    setTimeout(updateMyPosition, 1000);
    drawClients();


    $('input[name=email]').on('blur', function(){
      var email = $(this).val();
      var avatar = friendsAvatars[myselfID];
      avatar.info.email = email;
      myself.set(avatar.info);
    })

    $('input[name=status]').on('blur', function(){
      var status = $(this).val();
      var avatar = friendsAvatars[myselfID];
      avatar.info.status = status;
      myself.set(avatar.info);
    })


  })


})(jQuery);

