

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

////////////////////// SOURCE AND LAYER //////////////////////
map.on('style.load', function () {

  // source (id=sidewalkCafes)
  map.addSource('sidewalkCafes', {
    type: 'geojson',
    data: '/data/sidewalk-cafes.geojson'
  });

  // layer: sidewalk
  map.addLayer({
    'id': 'sidewalkCafes-fill', // layer id
    'type': 'circle', // fill the polygons
    'source': 'sidewalkCafes', // the source to paint
    'layout': {},
    'paint': {
      'circle-color':'#faff00',
      'circle-opacity':0.6,
      'circle-radius':{
        'property':'APP_CHAIRS',
            stops:[
              [{zoom: 8, value: 1}, 1], //min.nr of chairs
              [{zoom: 8, value: 135}, 2], // max.nr of chairs
              [{zoom: 11, value: 1}, 1],
              [{zoom: 11, value: 135}, 6],
              [{zoom: 16, value: 1}, 1],
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
      }
    })

    // add a layer for the highlighted lot
    map.addLayer({
      id: 'highlight-line',
      type: 'circle',
      source: 'highlight-feature',
      paint: {
        'circle-color':'#ff00ee',
        'circle-opacity':1,
        'circle-radius':{
          'property':'APP_CHAIRS',
              stops:[
                [{zoom: 8, value: 1}, 1], //min.nr of chairs
                [{zoom: 8, value: 135}, 2], // max.nr of chairs
                [{zoom: 11, value: 1}, 1],
                [{zoom: 11, value: 135}, 6],
                [{zoom: 16, value: 1}, 1],
                [{zoom: 16, value: 135}, 40]
              ]
        }
      }
    });

});
////////////////////// SOURCE AND LAYER //////////////////////

////////////////////// HOVER INTERACTIVITY //////////////////////
// Create a popup, but don't add it to the map yet.
var popup = new mapboxgl.Popup({
  closeButton: false,
  closeOnClick: false
});

// retrieve hover
map.on('mousemove', function (e) {
  //console.log(e)

  // query for the layer features under the mouse
  var features = map.queryRenderedFeatures(e.point, {
      layers: ['sidewalkCafes-fill'],
  });

  if (features.length > 0) {
      // show the Popup
      // Populate the popup and set its coordinates
      // based on the feature found

      var hoveredFeature = features[0]
      var cafeName = hoveredFeature.properties.BUSINESS_NAME2
      var street = hoveredFeature.properties.STREET
      var building = hoveredFeature.properties.BUILDING
      var chairs = hoveredFeature.properties.APP_CHAIRS

      var popupContent = `
        <div>
          ${cafeName}<br/>
          ${street+' '+building}<br/>
          ${'Size: '+chairs+' chairs'}
        </div>
      `
      popup.setLngLat(e.lngLat).setHTML(popupContent).addTo(map);

      // set this lot's polygon feature as the data for the highlight source
      map.getSource('highlight-feature').setData(hoveredFeature.geometry);

      // show the cursor as a pointer
      map.getCanvas().style.cursor = 'pointer';
    } else {
    //hide the popup if there are no features
    popup.remove();
    };
});
