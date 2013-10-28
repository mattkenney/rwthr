var weatherApp = angular.module('weatherApp', ['ui.bootstrap', 'ngResource']);

weatherApp.controller('WeatherCtrl', function ($scope, $resource)
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

    var isNavBarCollapsed = true;
    $scope.navBar = {
        toggle: function ()
        {
            isNavBarCollapsed = !isNavBarCollapsed;
        },

        classes: function ()
        {
            return  {
                'navbar-collapse':true,
                collapse:!!isNavBarCollapsed
            };
        },

        click: function (mode)
        {
            $scope.mode = mode;
            isNavBarCollapsed = true;
        },

        linkClass: function (mode)
        {
            return ($scope.mode == mode) ? 'active' : '';
        }
    };
});
