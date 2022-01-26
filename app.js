require([
    "esri/config",
    "esri/Map",
    "esri/views/MapView",

    "esri/Graphic",
    "esri/rest/route",
    "esri/rest/support/RouteParameters",
    "esri/rest/support/FeatureSet"

  ], function(esriConfig, Map, MapView, Graphic, route, RouteParameters, FeatureSet) {

  esriConfig.apiKey = "AAPKc1e6ad1254494a07aeee2c199b4b50a3Bex9o0ycQJTNRQdwJwNxPow1oLjCLgCsIZKf2eVM5xA0K-F_E4poWhYTE39GsGC3";

  const map = new Map({
    basemap: "arcgis-navigation" //Basemap layer service
  });

  const view = new MapView({
    container: "viewDiv",
    map: map,
    center: [-74.09408734975914,4.657865102765728], //Longitude, latitude, //Longitude, latitude
    zoom: 10
  });

  const routeUrl = "https://route-api.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World";

  view.on("click", function(event){

    if (view.graphics.length === 0) {
      addGraphic("origin", event.mapPoint);
    } else if (view.graphics.length === 1) {
      addGraphic("destination", event.mapPoint);

      getRoute(); // Call the route service

    } else {
      view.graphics.removeAll();
      addGraphic("origin",event.mapPoint);
    }

  });

  function addGraphic(type, point) {
    const graphic = new Graphic({
      symbol: {
        type: "simple-marker",
        color: (type === "origin") ? "white" : "black",
        size: "8px"
      },
      geometry: point
    });
    view.graphics.add(graphic);
  }

  function getRoute() {
    const routeParams = new RouteParameters({
      stops: new FeatureSet({
        features: view.graphics.toArray()
      }),

      returnDirections: true

    });

    route.solve(routeUrl, routeParams)
      .then(function(data) {
        data.routeResults.forEach(function(result) {
          result.route.symbol = {
            type: "simple-line",
            color: [232, 35, 35],
            width: 1
          };
          view.graphics.add(result.route);
        });

        // Display directions
       if (data.routeResults.length > 0) {
         const directions = document.createElement("ol");
         directions.classList = "esri-widget esri-widget--panel esri-directions__scroller";
         directions.style.marginTop = "50px";
         directions.style.padding = "50px";
         const features = data.routeResults[0].directions.features;

         // Show each direction
         features.forEach(function(result,i){
           const direction = document.createElement("li");
           direction.innerHTML = result.attributes.text + " (" + result.attributes.length.toFixed(2) + " miles)";
           directions.appendChild(direction);
         });

        view.ui.empty("top-left");
        view.ui.add(directions, "top-left");

       }

      })

      .catch(function(error){
          console.log(error);
      })

  }

});