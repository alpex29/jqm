'use strict';

var jqmControllers = angular.module('jqmControllers', [ 'jqmConstants', 'jqmServices' ]);

jqmControllers.controller('µNodeListCtrl', function($scope, $http, µNodeDto)
{
    $scope.nodes = µNodeDto.query();

    $scope.sortvar = 'jmxRegistryPort';
});

jqmControllers.controller('µNodeDetailCtrl', [ '$scope', '$routeParams', 'µNodeDto', function($scope, $routeParams, µNodeDto)
{
    $scope.nodeId = $routeParams.nodeId;
    $scope.error = null;

    $scope.error = function(errorResult)
    {
        console.debug(errorResult);
        $scope.error = errorResult.data;
    };

    $scope.node = µNodeDto.get({
        id : $routeParams.nodeId
    }, function()
    {
    }, $scope.error);

} ]);
