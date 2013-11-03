var weatherApp = angular.module('weatherApp', ['ui.bootstrap', 'ngResource', 'ngRoute']);

weatherApp.config(['$routeProvider', function($routeProvider)
{
    $routeProvider
        .when('/radar',
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
        .when('/where',
        {
            templateUrl: 'partials/where.html',
            controller: 'WhereCtrl'
        })
        .when('/about',
        {
            templateUrl: 'partials/about.html'
        })
        .otherwise(
        {
            redirectTo: '/radar'
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

    if ($window.ga)
    {
        var lastPath;
        $scope.$on('$routeChangeSuccess', function(event)
        {
            var path = $location.path();
            if (lastPath !== path)
            {
                lastPath = path;
                $window.ga('send', 'pageview', path);
            }
        });
    }
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

weatherApp.controller('WeatherCtrl', ['$scope', '$document', '$resource', function ($scope, $document, $resource)
{
    $scope.move = function (where)
    {
        var param = {}
        ,   radar = '/api/radar'
        ;
        if (where && where.lat && where.lon)
        {
            param.lat = where.lat;
            param.lon = where.lon;
            radar += '?lat=' + encodeURIComponent(where.lat);
            radar += '&lon=' + encodeURIComponent(where.lon);
        }
        $scope.place = $resource('/api/place').get(param);
        $scope.observation = $resource('/api/observation').get(param);
        $scope.range = $resource('/api/range').get(param);
        $scope.graph = $resource('/api/graph').get(param);
        $scope.radar = radar;
    };

    $scope.locate = function ()
    {
        $scope.move();

        if (navigator.geolocation)
        {
            function update(position)
            {
                if (position && position.coords)
                {
                    $scope.$apply(function ()
                    {
                        $scope.move({
                            lat: position.coords.latitude,
                            lon: position.coords.longitude
                        });
                    });
                }
            }
            var options = {
                maximumAge: 30 * 60 * 1000,
                timeout: 5000
            };
            navigator.geolocation.getCurrentPosition(update, null, options);
        }
    };

    $scope.locate();
}]);

weatherApp.controller('WhereCtrl', ['$scope', '$http', '$location', '$window', function ($scope, $http, $location, $window)
{
    var data = [];

    if ($window.localStorage)
    {
        var json = $window.localStorage.getItem("WhereCtrl.recent");
        if (json)
        {
            data = JSON.parse(json);
        }
    }

    $scope.recent = function ()
    {
        var result = data.slice();
        result.sort(function (a, b)
        {
            if (a.name < b.name) return -1;
            if (a.name > b.name) return 1;
            return 0;
        });
        result.unshift(
        {
            title: "Current location"
        });
        return result;
    };

    function save(where)
    {
        if (!where || !where.name) return;
        for (var i = 0; i < data.length; i++)
        {
            if (where.name === data[i].name)
            {
                data.splice(i, 1);
                break;
            }
        }
        data.push(where);
        if (data.length > 5)
        {
            data.shift();
        }
        if ($window.localStorage)
        {
            $window.localStorage.setItem("WhereCtrl.recent", JSON.stringify(data));
        }
    }

    $scope.search = function (text)
    {
        return $http.get("/api/search?q=" + encodeURIComponent(text)).then(function (response)
        {
            return response.data;
        });
    };

    $scope.choose = function (where)
    {
        save(where);
        $scope.move(where);
        $location.path('/radar');
    };
}]);
