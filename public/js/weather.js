var weatherApp=angular.module("weatherApp",["ui.bootstrap","ngResource","ngRoute"]);weatherApp.config(["$routeProvider",function(a){a.when("/radar",{templateUrl:"partials/forecast.html",controller:"RadarCtrl"}).when("/fiveday",{templateUrl:"partials/forecast.html",controller:"FiveDayCtrl"}).when("/atlantic",{templateUrl:"partials/forecast.html",controller:"AtlanticCtrl"}).when("/pacific",{templateUrl:"partials/forecast.html",controller:"PacificCtrl"}).when("/where",{templateUrl:"partials/where.html",controller:"WhereCtrl"}).when("/about",{templateUrl:"partials/about.html"}).otherwise({redirectTo:"/radar"})}]),weatherApp.controller("AtlanticCtrl",["$scope",function(a){a.image={alt:"Atlantic outlook",classname:"mw-tropic",src:"http://www.nhc.noaa.gov/tafb_latest/danger_atl_latestBW_sm2.gif"}}]),weatherApp.controller("FiveDayCtrl",["$scope",function(a){function b(){a.image={alt:"5 Day",classname:"mw-graph",src:a.graph.url}}b(),a.$watch("graph.url",b)}]),weatherApp.controller("NavBarCtrl",["$scope","$location","$window",function(a,b,c){var d=!0,e=function(){a.navBar.div={"navbar-collapse":!0,collapse:!!d}};if(a.navBar={li:function(a){return b.path()==a?"active":""},toggle:function(a){d=a===!1||(a===!0?!1:!d),e()}},e(),c.ga){var f;a.$on("$routeChangeSuccess",function(){var a=b.path();f!==a&&(f=a,c.ga("send","pageview",a))})}}]),weatherApp.controller("PacificCtrl",["$scope",function(a){a.image={alt:"Pacific outlook",classname:"mw-tropic",src:"http://www.nhc.noaa.gov/tafb_latest/danger_pac_latestBW_sm2.gif"}}]),weatherApp.controller("RadarCtrl",["$scope",function(a){function b(){a.image={alt:"Radar",classname:"mw-radar",src:a.radar}}b(),a.$watch("radar",b)}]),weatherApp.controller("WeatherCtrl",["$scope","$resource","$window","$location",function(a,b,c,d){a.go=function(a){d.path(a)},a.move=function(d){var e={_:Date.now()},f="/api/radar?_="+encodeURIComponent(e._);d&&d.lat&&d.lon&&(e.lat=d.lat,e.lon=d.lon,f+="&lat="+encodeURIComponent(d.lat),f+="&lon="+encodeURIComponent(d.lon)),a.place=b("/api/place").get(e),a.observation=b("/api/observation").get(e),a.range=b("/api/range").get(e),a.graph=b("/api/graph").get(e),a.radar=f,d&&d.name?c.localStorage.setItem("WeatherCtrl.where",JSON.stringify(d)):c.localStorage.removeItem("WeatherCtrl.where")},a.locate=function(){function b(b){b&&b.coords&&a.$apply(function(){a.move({lat:b.coords.latitude,lon:b.coords.longitude})})}if(a.move(),c.navigator&&c.navigator.geolocation){var d={maximumAge:18e5,timeout:5e3};c.navigator.geolocation.getCurrentPosition(b,null,d)}},a.load=function(){var b=c.localStorage.getItem("WeatherCtrl.where");if(b)var d=JSON.parse(b);d?a.move(d):a.locate()},a.load(),c.setInterval(function(){a.$apply(a.load)},3e5)}]),weatherApp.controller("WhereCtrl",["$scope","$http","$location","$window",function(a,b,c,d){function e(a){for(var b=0;b<f.length;b++)if(a.name===f[b].name){f.splice(b,1);break}f.push(a),f.length>5&&f.shift(),d.localStorage.setItem("WhereCtrl.recent",JSON.stringify(f))}var f=[],g=d.localStorage.getItem("WhereCtrl.recent");g&&(f=JSON.parse(g)),a.recent=function(){var a=f.slice();return a.sort(function(a,b){return a.name<b.name?-1:a.name>b.name?1:0}),a},a.search=function(a){return b.get("/api/search?q="+encodeURIComponent(a)).then(function(a){return a.data.places})},a.choose=function(b){b?(e(b),a.move(b)):a.locate(),c.path("/radar")}}]);