

// token
mapboxgl.accessToken = 'pk.eyJ1IjoiYWxiYWxzaW5hIiwiYSI6ImNqdjgzcG02MDAzYXE0NG10bnppcWVubnUifQ.y-ojeFlaX7V1W3DG6eL0fA';


options = {
  container: 'mapContainer', // container ID, the div
  style: 'mapbox://styles/mapbox/dark-v10',
  center: [-73.963566,40.743225], // [lng, lat]
  zoom: 12 // starting zoom level
}

// load the map
var map = new mapboxgl.Map(options);

var nameDisplay = document.getElementById('name');
var streetDisplay = document.getElementById('street');
var buildingDisplay = document.getElementById('loc');
var chairsDisplay = document.getElementById('chairs');

////////////////////// SOURCE AND LAYER //////////////////////
map.on('style.load', function () {


  // source (id=sidewalkCafes)
  map.addSource('sidewalkCafes', {
    type: 'geojson',
    data: 'data/sidewalk-cafes-withID.geojson'
  });

  /*
  // work in progress: load subway stations

  // source (id=subway)
  map.addSource('subway', {
    type: 'geojson',
    data: '/data/subway-stations.geojson'
  });

// layer: subway stations
  map.addLayer({
    'id': 'subwaystations', // layer id
    'type': 'symbol', // fill the polygons
    'source': 'subway', // the source to paint
    'layout': {
      'icon-image':'/im/icon-01.png',
      //'icon-size':
    }
  });
  */

  // layer: sidewalk
  map.addLayer({
    'id': 'sidewalkCafes-fill', // layer id
    'type': 'circle', // fill the polygons
    'source': 'sidewalkCafes', // the source to paint
    'layout': {},
    'paint': {
      //'circle-color':'#faff00',

      'circle-color': [
          'match',
          ['get', 'APP_SWC_TYPE'],
          'Enclosed',
          '#faff00',
          'Regular Unenclosed/Small Unenclosed',
          '#f09835',
          'Small Unenclosed',
          '#e63232',
          'Unenclosed',
          '#3bb2d0',
          /* other */ '#ccc'
          ],
      'circle-opacity':0.6,
      'circle-radius':{
        'property':'APP_CHAIRS',
            stops:[
              [{zoom: 8, value: 1}, 2], //min.nr of chairs
              [{zoom: 8, value: 135}, 4], // max.nr of chairs
              [{zoom: 11, value: 1}, 2],
              [{zoom: 11, value: 135}, 7],
              [{zoom: 16, value: 1}, 2],
              [{zoom: 16, value: 135}, 40]
            ]
      }
    }
  });

  // empty data source for hover-highlight
  map.addSource('highlight-feature', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
      },
      'generateId':true //This ensures that all features have unique IDs
    })

    // add a layer for the highlighted lot
    map.addLayer({
      id: 'highlight-line',
      type: 'circle',
      source: 'highlight-feature',
      paint: {
        'circle-stroke-color':'#ffffff',
        'circle-stroke-width':2,
        'circle-opacity':1,
        'circle-radius':{
          'property':'APP_CHAIRS',
              stops:[
                [{zoom: 8, value: 2}, 1], //min.nr of chairs
                [{zoom: 8, value: 135}, 2], // max.nr of chairs
                [{zoom: 11, value: 2}, 1],
                [{zoom: 11, value: 135}, 6],
                [{zoom: 16, value: 2}, 1],
                [{zoom: 16, value: 135}, 40]
              ]
        }
      }
    });
});
////////////////////// SOURCE AND LAYER //////////////////////

////////////////////// HOVER INTERACTIVITY //////////////////////
var cafeID = null;

// retrieve hover
map.on('mousemove', 'sidewalkCafes-fill', (e) => {
  //console.log(e)
  map.getCanvas().style.cursor = 'pointer';

  // Set variables equal to the current feature's magnitude, location, and time
  var sidewalkcafeName = e.features[0].properties.BUSINESS_NAME2
  var sidewalkcafeStreet = e.features[0].properties.STREET
  var sidewalkcafeBuilding = e.features[0].properties.BUILDING
  var sidewalkcafeChairs = e.features[0].properties.APP_CHAIRS

  // Check whether features exist
  if (e.features.length > 0) {

    // Display the information in the sidebar
    nameDisplay.textContent = sidewalkcafeName;
    streetDisplay.textContent = sidewalkcafeStreet;
    buildingDisplay.textContent = sidewalkcafeBuilding;
    chairsDisplay.textContent = sidewalkcafeChairs;

    // set this lot's polygon feature as the data for the highlight source
    map.getSource('highlight-feature').setData(e.features[0].geometry);

        // If cafeID for the hovered feature is not null,
        // use removeFeatureState to reset to the default behavior
        if (cafeID) {
          map.removeFeatureState({
            source: "sidewalkCafes",
            id: cafeID
          });
        }

        cafeID = e.features[0].id;

        // When the mouse moves over the sidewalkcafe-viz layer, update the
        // feature state for the feature under the mouse
        map.setFeatureState({
          source: 'sidewalkCafes',
          id: cafeID,
        }, {
          hover: true
        });
    };
});
////////////////////// HOVER INTERACTIVITY //////////////////////




////////////////////// HOVER: reset feature state //////////////////////
map.on("mouseleave", "sidewalkCafes-fill", function() {
  if (cafeID) {
    map.setFeatureState({
      source: 'sidewalkCafes',
      id: cafeID
    }, {
      hover: false
    });
  }

  cafeID = null;
  // Remove the information from the previously hovered feature from the sidebar
  nameDisplay.textContent = '';
  streetDisplay.textContent = '';
  //buildingDisplay.textContent = '';
  chairsDisplay.textContent = '';

  // Reset the cursor style
  map.getCanvas().style.cursor = '';
});
////////////////////// HOVER: reset feature state //////////////////////
