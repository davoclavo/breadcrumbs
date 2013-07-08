var breadcrumbs = new Firebase('https://breadcrumbs.firebaseIO.com/');
var trail, crumbs, users;

var pinShadow = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_shadow",
        new google.maps.Size(40, 37),
        new google.maps.Point(0, 0),
        new google.maps.Point(12, 35));

var router = new (Backbone.Router.extend({
  routes: {
    'trail/:id': 'trail',
    '':          'root'
  },

  root: function() {
    router.navigate("trail/" + randomHex(6), {trigger: true, replace: true});
  },

  trail: function(id) {
    trail = breadcrumbs.child('trails').child(id);
    crumbs = trail.child('crumbs');
    users = trail.child('users');

    $("input[name=trail]").val(id);

    loadTrail();
  }
}))

console.log("router: ", router)

Backbone.history.start({pushState: false});


// crumbs.push({
//   lat: -12.043333,
//   lng: -77.028333
// });

$(document).ready(function(){
  map = new GMaps({
    div: '#map',
    lat: -12.043333,
    lng: -77.028333,
    click: function(ev){
      crumbs.push({
        lat: ev.latLng.lat(),
        lng: ev.latLng.lng()
      })
    }
  });

  $("input[name=trail]").on('blur', function(e){
     router.navigate("trail/" + this.value)
  })

});

function loadTrail() {

  var localUsers = {};

  users.on('value', function(s){
    s.forEach(function(b) {
      newUser(b);
    });
  });

  users.on('child_changed', function(s){
    var userMarker = localUsers[s.name()];
    if(typeof userMarker === 'undefined') {
      newUser(s);
    }
    else {
      console.log(s.val().lat, s.val().lng);
      userMarker.animatedMoveTo(s.val().lat, s.val().lng);
    }
  });

  users.on('child_removed', function(s) {
    var userMarker = localUsers[s.name()];
    if(typeof userMarker !== 'undefined') {
      userMarker.setMap(null);
      delete localUsers[s.name()];
    }
  });

  function newUser(u) {
      // var marker = new google.maps.Marker({ icon: 'http://chart.googleapis.com/chart?chst=d_bubble_icon_text_small&chld=' + iconType + '|bbT|'+bus.routeTag+'|' + directionColor + '|eee', position: busLatLng, map: map });
      var user = $.extend(u.val(), {'name': u.name()});
      var color = user.isOwner ? 'FF0000' : '0000FF';
      marker = map.addMarker({
        lat: user.lat,
        lng: user.lng,
        icon: colorIcon(color),
        shadow: pinShadow
      });
      localUsers[user.name] = marker;
  }

  // crumbs.on('value', function(s){
  //   s.forEach(function(b) {
  //     newCrumb(b);
  //   });
  // })

  var localCrumbs = {};

  crumbs.on('child_added', function(s){
    newCrumb(s);
  });

  crumbs.on("child_removed", function(s) {
    var crumbMarker = localCrumbs[s.name()];
    if(typeof crumbMarker !== 'undefined') {
      crumbMarker.setMap(null);
      delete localCrumbs[s.name()];
    }
  });

  function newCrumb(c) {
    // var marker = new google.maps.Marker({ icon: 'http://chart.googleapis.com/chart?chst=d_bubble_icon_text_small&chld=' + iconType + '|bbT|'+bus.routeTag+'|' + directionColor + '|eee', position: busLatLng, map: map });
    var crumb = $.extend(c.val(), {'name': c.name()});
    marker = map.addMarker({
      lat: crumb.lat,
      lng: crumb.lng,
      icon: "/img/breadcrumb.png",
      verticalAlign: 'center',
      horizontalAlign: 'center'
    });
    localCrumbs[crumb.name] = marker;
    console.log('Crumb added!\n',crumb.lat,crumb.lng);
  }

}


// http://stackoverflow.com/a/7686977/756000
function colorIcon(color){
  // var pinImage = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter_withshadow&chld=|" + color,
  var pinImage = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=|" + color,
          new google.maps.Size(21, 34),
          new google.maps.Point(0,0),
          new google.maps.Point(10, 34));
  return pinImage;
}

function randomHex(len) {
  return (new Array(len).join(0)
          + parseInt(Math.pow(2, len * 4) * Math.random()
                    ).toString(16)).slice(-len);
}
