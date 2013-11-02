var weatherApp=angular.module("weatherApp",["ui.bootstrap","ngResource","ngRoute"]);weatherApp.config(["$routeProvider",function(a){a.when("/",{templateUrl:"partials/forecast.html",controller:"RadarCtrl"}).when("/fiveday",{templateUrl:"partials/forecast.html",controller:"FiveDayCtrl"}).when("/atlantic",{templateUrl:"partials/forecast.html",controller:"AtlanticCtrl"}).when("/pacific",{templateUrl:"partials/forecast.html",controller:"PacificCtrl"}).when("/about",{templateUrl:"partials/about.html"}).otherwise({redirectTo:"/"})}]),weatherApp.controller("AtlanticCtrl",["$scope",function(a){a.image={alt:"Atlantic outlook",classname:"mw-tropic",src:"http://www.nhc.noaa.gov/tafb_latest/danger_atl_latestBW_sm2.gif"}}]),weatherApp.controller("FiveDayCtrl",["$scope",function(a){a.image={alt:"5 Day",classname:"mw-graph",src:a.graph.url}}]),weatherApp.controller("NavBarCtrl",["$scope","$location",function(a,b,c){var d=!0,e=function(){a.navBar.div={"navbar-collapse":!0,collapse:!!d}};a.navBar={li:function(a){return b.path()==a?"active":""},toggle:function(a){d=a===!1||(a===!0?!1:!d),e()}},e(),a.$on("$routeChangeSuccess",function(){c.ga("send","pageview",b.path())})}]),weatherApp.controller("PacificCtrl",["$scope",function(a){a.image={alt:"Pacific outlook",classname:"mw-tropic",src:"http://www.nhc.noaa.gov/tafb_latest/danger_pac_latestBW_sm2.gif"}}]),weatherApp.controller("RadarCtrl",["$scope",function(a){a.image={alt:"Radar",classname:"mw-radar",src:a.radar}}]),weatherApp.controller("WeatherCtrl",["$scope","$resource",function(a,b){function c(c){var d="/api/radar";if(c&&c.coords){var e={lat:c.coords.latitude,lon:c.coords.longitude};d+="?lat="+encodeURIComponent(c.coords.latitude),d+="&lon="+encodeURIComponent(c.coords.longitude)}update=function(){a.place=b("/api/place").get(e),a.observation=b("/api/observation").get(e),a.range=b("/api/range").get(e),a.radar=d,a.graph=b("/api/graph").get(e)},c?a.$apply(update):update()}if(c(),navigator.geolocation){var d={maximumAge:18e5,timeout:5e3};navigator.geolocation.getCurrentPosition(c,null,d)}}]);