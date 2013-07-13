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
}));


Backbone.history.start({pushState: false});

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

function loadTrail(){
  var User = Backbone.Model.extend({
    getGooglePosition: function(){
      return new google.maps.LatLng(this.get('lat'), this.get('lng'));
    }
  });

  var UserList = Backbone.Firebase.Collection.extend({
    model: User,
    firebase: trail.child('users'),
    myself: function(){
      if (!this._myself){
        //TODO: Buscarlo en session storage
        this._myself = new User();
        this.add(this._myself);
      }
      return this._myself;
    },
    setMyself: function(user){
      this._myself = user;
      return this;
    }
  });

  var users = new UserList();

  users.on('add',function(user){
    var view = new UserView({model: user});
    view.render();
  });

  var UserView = Backbone.View.extend({
    initialize: function(){
      this.listenTo(this.model, "change", this.render);

      var user = this.model;

      var color = user.get('isOwner') ? 'FF0000' : '0000FF';
      this.marker = map.addMarker({
        lat: user.get('lat'),
        lng: user.get('lng'),
        icon: colorIcon(color),
        shadow: pinShadow
      });
    },
    render: function(){
      // Updatear las coordenadas del marker
      //TODO: Usar animate
      // this.marker.setPosition(this.model.getGooglePosition());
      this.marker.animatedMoveTo(this.model.get('lat'), this.model.get('lng'));
    }
  });


  navigator.geolocation.getCurrentPosition(function(pos){

    var myself = new User({
      lat: pos.coords.latitude,
      lng: pos.coords.longitude
    });

    users.setMyself(myself);

    var updaterInterval = setInterval(pollMyPosition, 4000);

  });




  var updateMyPosition = function(pos){
    console.log("YOUR NEW POSITION IS ", pos)
    users.myself().set({
      lat: pos.coords.latitude,
      lng: pos.coords.longitude
    })
  }

  var pollMyPosition = function(){
    console.log("GETTING YOUR BROWSER POSITION")
    navigator.geolocation.getCurrentPosition(updateMyPosition);
  }

}




function loadTrailOld() {

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


