'use strict';

var jqmControllers = angular.module('jqmControllers', [ 'jqmConstants', 'jqmServices', 'ui.bootstrap' ]);

jqmControllers.controller('µNodeListCtrl', function($scope, $http, µNodeDto)
{
    $scope.items = null;
    $scope.selected = [];

    $scope.sortvar = 'jmxRegistryPort';

    $scope.save = function()
    {
        // Save and refresh the table - ID may have been generated by the server.
        µNodeDto.saveAll({}, $scope.items, $scope.refresh);
    };

    $scope.refresh = function()
    {
        $scope.selected.length = 0;
        $scope.items = µNodeDto.query();
    };

    // Only remove from list - save() will sync the list with the server so no need to delete it from server now
    $scope.remove = function()
    {
        var q = null;
        for ( var i = 0; i < $scope.selected.length; i++)
        {
            q = $scope.selected[i];
            $scope.items.splice($scope.items.indexOf(q), 1);
        }
        $scope.selected.length = 0;
    };

    $scope.filterOptions = {
        filterText : '',
    };

    $scope.gridOptions = {
        data : 'items',
        enableCellSelection : true,
        enableRowSelection : true,
        enableCellEditOnFocus : true,
        multiSelect : true,
        showSelectionCheckbox : true,
        selectWithCheckboxOnly : true,
        selectedItems : $scope.selected,
        showGroupPanel : false,
        filterOptions : $scope.filterOptions,

        columnDefs : [
                {
                    field : 'id',
                    displayName : 'ID',
                    width : '*',
                },
                {
                    field : 'name',
                    displayName : 'Name',
                    width : '**',
                },
                {
                    field : 'dns',
                    displayName : 'DNS to bind to',
                    width : '**',
                },
                {
                    field : 'port',
                    displayName : 'HTTP port',
                    width : '*',
                },
                {
                    field : 'outputDirectory',
                    displayName : 'File produced storage',
                    width : '***',
                },
                {
                    field : 'jobRepoDirectory',
                    displayName : 'Directory containing jars',
                    width : '***',
                },
                {
                    field : 'rootLogLevel',
                    displayName : 'Log level',
                },
                {
                    field : 'jmxRegistryPort',
                    displayName : 'jmxRegistryPort',
                },
                {
                    field : 'jmxServerPort',
                    displayName : 'jmxServerPort',
                },
                {
                    field : 'loapApiSimple',
                    displayName : 'Simple API',
                    cellTemplate : '<div class="ngSelectionCell" ng-class="col.colIndex()">'
                            + ' <input type="checkbox" ng-input="COL_FIELD" ng-model="COL_FIELD"/></div>',
                    width : '*',
                },
                {
                    field : 'loadApiClient',
                    displayName : 'Client API',
                    cellTemplate : '<div class="ngSelectionCell" ng-class="col.colIndex()">'
                            + ' <input type="checkbox" ng-input="COL_FIELD" ng-model="COL_FIELD"/></div>',
                    width : '*',
                },
                {
                    field : 'loadApiAdmin',
                    displayName : 'Admin API',
                    cellTemplate : '<div class="ngSelectionCell" ng-class="col.colIndex()">'
                            + ' <input type="checkbox" ng-input="COL_FIELD" ng-model="COL_FIELD"/></div>',
                    width : '*',
                }, ]
    };

    $scope.stop = function()
    {
        var q = null;
        for ( var i = 0; i < $scope.selected.length; i++)
        {
            q = $scope.selected[i];
            q.stop = true;
            q.$save();
        }
    };

    $scope.refresh();
});

jqmControllers.controller('µNodeDetailCtrl', [ '$scope', '$routeParams', 'µNodeDto', function($scope, $routeParams, µNodeDto)
{
    $scope.nodeId = $routeParams.nodeId;
    $scope.error = null;

    $scope.onError = function(errorResult)
    {
        console.debug(errorResult);
        $scope.error = errorResult.data;
    };

    $scope.node = µNodeDto.get({
        id : $routeParams.nodeId
    }, function()
    {
    }, $scope.onError);

} ]);
