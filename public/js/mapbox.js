var mapboxgl = require('mapbox-gl/dist/mapbox-gl');
mapboxgl.accesToken =
  sk.eyJ1IjoidHVhbmtpZXRjb2RlciIsImEiOiJjbGsxemtpcmUwNnIwM2dveWVvZXA4YW0xIn0.Hqc8J0yjnce750EGmrjV3A;
var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11',
});
