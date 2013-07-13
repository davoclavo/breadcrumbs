
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

