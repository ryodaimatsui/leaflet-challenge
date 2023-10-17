// Set the URL to be pulled using D3.js.
let queryURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson";

// Read in the URL, and print the JSON on the console to evaluate the data.  
d3.json(queryURL).then(function(data){
    console.log(data);
    createFeatures(data.features)
});

function colorOptions(depth){
    switch(true) {
        case depth >= -10 && depth <= 10:
            return 'green';
        case depth > 10 && depth <= 30:
            return 'lightgreen';
        case depth > 30 && depth <= 50:
            return 'yellow';
        case depth > 50 && depth <= 70:
            return 'orange';
        case depth > 70 && depth <= 90:
            return 'darkorange';
        case depth > 90:
            return 'red'
        default:
            return 'lightgreen'    
    }
};

function createFeatures(earthquakeData){
    
    function onEachFeature(feature, layer){
        layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p>`);
    }
    
    function pointToLayer(feature, latlng){
        let depth = feature.geometry.coordinates[2];
        let set = {
            radius: feature.properties.mag * 20000,
            color: colorOptions(depth),
            fillColor: colorOptions(depth),
            fillOpacity: 0.5
        }
        return L.circle(latlng, set);
    }

     let earthquakes = L.geoJSON(earthquakeData,{
        onEachFeature: onEachFeature, 
        pointToLayer: pointToLayer
    });

    createMaps(earthquakes);
}



function createMaps(earthquakes) {
    // Set the basemap layer
    let gray = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
        attribution: '<a style="font-size: 16px" href="https://www.openstreetmap.org/copyright">©OpenStreetMap</a>, <a style="font-size: 16px" href="https://carto.com/attributions">©CartoDB</a>'
    });

    let satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '<a style="font-size: 16px" href="https://www.esri.com/en-us/legal/terms/full-master-agreement">© Esri</a>'
    });

    let baseMaps = {
        'Gray Scale': gray,
        'Satellite': satellite
    };

    let overlayMaps = {
        'Earthquakes': earthquakes
    };
    
    // Initial map 
    let myMap = L.map("map", {
        center: [35.8617, 104.1954],
        zoom: 4, 
        layers: [gray, earthquakes]
    });

    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    let depthRanges = [
        {range: '-10—10km', color: 'green'},
        {range: '10—30km', color: 'lightgreen'},
        {range: '30—50km', color: 'yellow'},
        {range: '50—70km', color: 'orange'},
        {range: '70—90km', color: 'darkorange'},
        {range: '+90km', color: 'red'}
    ];

    let legend = L.control({position: 'bottomright'});
    legend.onAdd = function(map) {
        let div = L.DomUtil.create('div', 'legend');
        div.innerHTML = "<h3 style='text-align: center'>Depth</h3>"
        depthRanges.forEach((range) => {
            div.innerHTML += `<i style="background:${range.color}"></i> ${range.range}<br>`
        });
        return div;
    };
    legend.addTo(myMap);
};

