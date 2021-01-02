var weatherApp = angular.module('weatherApp', ['ui.bootstrap', 'ngResource', 'ngRoute']);

weatherApp.config(['$routeProvider', function($routeProvider)
{
    $routeProvider
        .when('/radar',
        {
            templateUrl: 'partials/radar.html',
            controller: 'RadarCtrl'
        })
        .when('/fiveday',
        {
            templateUrl: 'partials/forecast.html',
            controller: 'FiveDayCtrl'
        })
        .when('/atlantic',
        {
            templateUrl: 'partials/tropics.html',
            controller: 'AtlanticCtrl'
        })
        .when('/pacific',
        {
            templateUrl: 'partials/tropics.html',
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
    $scope.src = '/tropics';
}]);

weatherApp.controller('FiveDayCtrl', ['$scope', function ($scope)
{
    function update()
    {
        $scope.image =
        {
            alt: '5 Day',
            classname: 'mw-graph',
            src: $scope.graph
        };
    }

    update();

    $scope.$watch('graph.url', update);
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
    $scope.src = '/tropics#pacific';
}]);

weatherApp.controller('RadarCtrl', ['$scope', '$document', function ($scope, $document)
{
    function updateLastVisibility()
    {
        if ($document.prop('visibilityState') === 'visible')
        {
            $scope.lastVisibility = Date.now();
            if ($scope.layer)
            {
                $scope.layer.setParams({ _: $scope.lastVisibility });
            }
        }
    }

    $document.on('visibilitychange', updateLastVisibility);
    $scope.$on("$destroy", function ()
    {
        if ($scope.map)
        {
            $scope.map.remove();
        }
        $document.off('visibilitychange', updateLastVisibility);
    });

    updateLastVisibility();

    var map = $scope.map = L.map('mapid');

    L.tileLayer(mwthr.base.url, mwthr.base.options).addTo(map);
    $scope.layer = L.tileLayer
        .wms(mwthr.radar.url, mwthr.radar.options)
        .setParams({ _: $scope.lastVisibility })
        .on('loading', function ()
        {
            $scope.$evalAsync(function (scope)
            {
                scope.loading = true;
            });
        })
        .on('load', function ()
        {
            $scope.$evalAsync(function (scope)
            {
                scope.loading = false;
            });
        })
        .addTo(map);
        ;

    function update()
    {
        map.setView([$scope.lat, $scope.lon], 8);
    }

    update();

    $scope.$watch('radar', update);
}]);

weatherApp.controller('WeatherCtrl', ['$scope', '$resource', '$window', '$location', function ($scope, $resource, $window, $location)
{
    $scope.go = function (path)
    {
        $location.path(path);
    };

    $scope.move = function (where)
    {
        $scope.param = { _: Date.now() };
        var radar = '/api/radar?_=' + encodeURIComponent($scope.param._)
        ,   graph = '/api/graph?_=' + encodeURIComponent($scope.param._)
        ;
        $scope.lat = 40;
        $scope.lon = -75;
        if (where && where.lat && where.lon)
        {
            $scope.lat = where.lat;
            $scope.lon = where.lon;
            $scope.param.lat = where.lat;
            $scope.param.lon = where.lon;
            radar += '&lat=' + encodeURIComponent(where.lat);
            radar += '&lon=' + encodeURIComponent(where.lon);
            graph += '&lat=' + encodeURIComponent(where.lat);
            graph += '&lon=' + encodeURIComponent(where.lon);
        }
        $scope.place = $resource('/api/place').get($scope.param);
        $scope.observation = $resource('/api/observation').get($scope.param);
        $scope.range = $resource('/api/range').get($scope.param);
        $scope.graph = graph;
        $scope.radar = radar;

        if (where && where.name)
        {
            $window.localStorage.setItem("WeatherCtrl.where", JSON.stringify(where));
        }
        else
        {
            $window.localStorage.removeItem("WeatherCtrl.where");
        }
    };

    $scope.locate = function ()
    {
        $scope.move();

        if ($window.navigator && $window.navigator.geolocation)
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
            $window.navigator.geolocation.getCurrentPosition(update, null, options);
        }
    };

    $scope.load = function ()
    {
        var json = $window.localStorage.getItem("WeatherCtrl.where");
        if (json)
        {
            var where = JSON.parse(json);
        }
        if (where)
        {
            $scope.move(where);
        }
        else
        {
            $scope.locate();
        }
    };

    $scope.load();

    $window.setInterval(function ()
    {
        $scope.$apply($scope.load);
    }, 5*60*1000);
}]);

weatherApp.controller('WhereCtrl', ['$scope', '$http', '$location', '$window', function ($scope, $http, $location, $window)
{
    var data = [];

    var json = $window.localStorage.getItem("WhereCtrl.recent");
    if (json)
    {
        data = JSON.parse(json);
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
        return result;
    };

    function save(where)
    {
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
        $window.localStorage.setItem("WhereCtrl.recent", JSON.stringify(data));
    }

    $scope.search = function (text)
    {
        return $http.get('/api/search?q=' + encodeURIComponent(text)).then(function (response)
        {
            return response.data.places;
        });
    };

    $scope.choose = function (where)
    {
        if (where)
        {
            save(where);
            $scope.move(where);
        }
        else
        {
            $scope.locate();
        }
        $location.path('/radar');
    };
}]);
