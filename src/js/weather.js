var weatherApp = angular.module('weatherApp', ['ui.bootstrap', 'ngResource', 'ngRoute']);

weatherApp.config(['$routeProvider', function($routeProvider)
{
    $routeProvider
        .when('/',
        {
            templateUrl: 'partials/forecast.html',
            controller: 'RadarCtrl'
        })
        .when('/fiveday',
        {
            templateUrl: 'partials/forecast.html',
            controller: 'FiveDayCtrl'
        })
        .when('/atlantic',
        {
            templateUrl: 'partials/forecast.html',
            controller: 'AtlanticCtrl'
        })
        .when('/pacific',
        {
            templateUrl: 'partials/forecast.html',
            controller: 'PacificCtrl'
        })
        .when('/about',
        {
            templateUrl: 'partials/about.html'
        })
        .otherwise(
        {
            redirectTo: '/'
        })
        ;
}]);

weatherApp.controller('AtlanticCtrl', ['$scope', function ($scope)
{
    $scope.image =
    {
        alt: 'Atlantic outlook',
        classname: 'mw-tropic',
        src: 'http://www.nhc.noaa.gov/tafb_latest/danger_atl_latestBW_sm2.gif'
    };
}]);

weatherApp.controller('FiveDayCtrl', ['$scope', function ($scope)
{
    $scope.image =
    {
        alt: '5 Day',
        classname: 'mw-graph',
        src: $scope.graph.url
    };
}]);

weatherApp.controller('NavBarCtrl', ['$scope', '$location', '$window', function ($scope, $location, $window)
{
    var isCollapse = true;

    var updateDiv = function ()
    {
        $scope.navBar.div =
        {
            'navbar-collapse':true,
            collapse:!!isCollapse
        };
    };

    $scope.navBar =
    {
        li: function (path)
        {
            return ($location.path() == path) ? 'active' : '';
        },

        toggle: function (value)
        {
            isCollapse = (value === false) || ((value === true) ? false : !isCollapse);
            updateDiv();
        }
    };

    updateDiv();

    $scope.$on('$routeChangeSuccess', function(event)
    {
        $window.ga('send', 'pageview', $location.path());
    });
}]);

weatherApp.controller('PacificCtrl', ['$scope', function ($scope)
{
    $scope.image =
    {
        alt: 'Pacific outlook',
        classname: 'mw-tropic',
        src: 'http://www.nhc.noaa.gov/tafb_latest/danger_pac_latestBW_sm2.gif'
    };
}]);

weatherApp.controller('RadarCtrl', ['$scope', function ($scope)
{
    $scope.image =
    {
        alt: 'Radar',
        classname: 'mw-radar',
        src: $scope.radar
    };
}]);

weatherApp.controller('WeatherCtrl', ['$scope', '$resource', function ($scope, $resource)
{
    function locate(position)
    {
        var radar = '/api/radar';
        if (position && position.coords)
        {
            var where = {
                lat: position.coords.latitude,
                lon: position.coords.longitude
            };
            radar += '?lat=' + encodeURIComponent(position.coords.latitude);
            radar += '&lon=' + encodeURIComponent(position.coords.longitude);
        }

        update = function ()
        {
            $scope.place = $resource('/api/place').get(where);
            $scope.observation = $resource('/api/observation').get(where);
            $scope.range = $resource('/api/range').get(where);
            $scope.radar = radar;
            $scope.graph = $resource('/api/graph').get(where);
        };

        if (position)
        {
            $scope.$apply(update);
        }
        else
        {
            update();
        }
    }

    locate();
    if (navigator.geolocation)
    {
        var options = {
            maximumAge: 30 * 60 * 1000,
            timeout: 5000
        };
        navigator.geolocation.getCurrentPosition(locate, null, options);
    }

}]);
