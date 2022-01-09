// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var geojson;

// Perform a GET request to the query URL
d3.json(queryUrl).then(function(data) {
    console.log(data.features);
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.title +
      "</h3><hr><p>" + "Depth of earth " + feature.geometry.coordinates[2] + "</p>");
  }

  function getColor(d) {
    return d > 70   ? 'darkgreen' :
            d > 60  ? 'green' :
            d > 50  ? 'limegreen' :
            d > 40  ? 'lime' :
            d > 30  ? 'springgreen' :
            d > 20  ? 'chartreuse' :
            d > 10  ? 'greenyellow' :
            d> -10  ? 'yellow' :
                      '#777575';
  }
  
  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = new L.geoJSON(earthquakeData, {
    pointToLayer: (earthquakeData, latlng) => {
            console.log (Math.max(earthquakeData.geometry.coordinates[2]))
            return new L.CircleMarker([earthquakeData.geometry.coordinates[1], earthquakeData.geometry.coordinates[0]], {
            stroke: true,
            weight: 1,
            fillOpacity: 1,
            color: "green",
            fillColor: getColor(earthquakeData.geometry.coordinates[2]),
            radius: earthquakeData.properties.mag*3.5
          });
        },
    onEachFeature: onEachFeature
  });

  console.log(earthquakes);

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": streetmap,
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [streetmap, earthquakes]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  
  var legend = L.control({ position: "bottomright" });
  legend.onAdd = function() {
    var div = L.DomUtil.create("div", "info legend");
    var limits = [-10, 10, 20, 30, 40, 50, 60, 70];
    var colors = ['yellow','greenyellow', 'chartreuse', 'springgreen', 'lime', 'limegreen', 'green', 'darkgreen']
    var labels = [];

    // Add min & max
    var legendInfo = "<div class=\"labels\">" +
        "<div class=\"min\">" + limits[0] + "</div>" +
        "<div class=\"max\">" + limits[limits.length - 1] + "</div>" +
      "</div>";

    div.innerHTML = legendInfo;

    limits.forEach(function(limit, index) {
      labels.push("<li style=\"background-color: " + colors[index] + "\"></li>");
    });

    div.innerHTML += "<ul>" + labels.join("") + "</ul>";
    return div;
  };

  // Add legend to the map
  legend.addTo(myMap);

}
