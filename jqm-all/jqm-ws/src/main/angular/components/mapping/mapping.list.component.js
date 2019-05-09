'use strict';

import template from './mapping.list.template.html';
import { createGlobalFilter } from '../../helpers/filters';

class QueueMappingListCtrl {
	constructor(µQueueMappingDto, µQueueDto, µNodeDto, jqmCellTemplateBoolean, jqmCellEditorTemplateBoolean, $interval) {
		var ctx = this;

		this.µQueueMappingDto = µQueueMappingDto;
		this.µQueueDto = µQueueDto;
		this.µNodeDto = µNodeDto;
		this.$interval = $interval;

		this.mappings = [];
		this.queues = [];
		this.nodes = [];
		this.selected = [];
		this.bDbBusy = false;
		this.error = null;

		this.filterOptions = {
			filterText: '',
		};

		this.gridOptions = {
			data: '$ctrl.mappings',

			enableSelectAll: false,
			enableRowSelection: true,
			enableRowHeaderSelection: true,
			enableFullRowSelection: false,
			enableFooterTotalSelected: false,
			multiSelect: true,
			enableSelectionBatchEvent: false,
			noUnselect: false,

			onRegisterApi: function (gridApi) {
				ctx.gridApi = gridApi;
				gridApi.selection.on.rowSelectionChanged(null, function (rows) {
					ctx.selected = gridApi.selection.getSelectedRows();
				});
				ctx.gridApi.grid.registerRowsProcessor(createGlobalFilter(ctx, ['node.name', 'queue.name']), 200);
			},

			enableColumnMenus: false,
			enableCellEditOnFocus: true,
			virtualizationThreshold: 20,
			enableHorizontalScrollbar: 0,

			columnDefs: [
				{
					field: 'nodeId',
					displayName: 'Node',
					cellTemplate: '<div class="ui-grid-cell-contents">{{ (row.entity["nodeId"] | getByProperty:"id":grid.appScope.$ctrl.nodes).name }}</div>',
					editableCellTemplate: 'ui-grid/dropdownEditor',
					editDropdownValueLabel: 'name',
					editDropdownOptionsArray: this.nodes,
				},
				{
					field: 'queueId',
					displayName: 'Queue',
					cellTemplate: '<div class="ui-grid-cell-contents">{{ (row.entity["queueId"] | getByProperty:"id":grid.appScope.$ctrl.queues).name }}</div>',
					editableCellTemplate: 'ui-grid/dropdownEditor',
					editDropdownValueLabel: 'name',
					editDropdownOptionsArray: this.queues,
				},
				{
					field: 'pollingInterval',
					displayName: 'Polling Interval (ms)',
					editableCellTemplate: '<div><form name="inputForm"><input type="number" min="100" max="10000000" ng-required="true" ng-class="\'colt\' + col.uid" ui-grid-editor ng-model="MODEL_COL_FIELD" /></form></div>',
				},
				{
					field: 'nbThread',
					displayName: 'Max concurrent running instances',
					editableCellTemplate: '<div><form name="inputForm"><input type="number" min="1" max="1000" ng-required="true" ng-class="\'colt\' + col.uid" ui-grid-editor ng-model="MODEL_COL_FIELD" /></form></div>',
				}, {
					field: 'enabled',
					displayName: 'Enabled',
					cellTemplate: jqmCellTemplateBoolean,
					editableCellTemplate: jqmCellEditorTemplateBoolean,
					width: '*',
				},]
		};

		// TODO: duplicates handling.
		/*$scope.$watch('mappings', function (newMappings) {
			var q = null;
			var nodes = {};
			for (var i = 0; i < newMappings.length; i++) {
				q = newMappings[i];
				if (!(q.nodeId in nodes)) {
					nodes[q.nodeId] = [];
				}
				var nodeMappings = nodes[q.nodeId];

				if (nodeMappings.indexOf(q.queueId) != -1) {
					$scope.error = {
						"userReadableMessage": "Cannot have two mappings for the same queue inside a single node",
						"errorCode": null,
					};
					return;
				}
				nodeMappings.push(q.queueId);
			}

			// If here, no duplicates
			$scope.error = null;
		}, true);*/

		this.helpcontent = {
			title: "Mappings specify which nodes will poll which queues. They are basically nodes subscribing to queues.",
			paragraphs: ["On this page, one may associate nodes with queues. Running nodes will (by default) check every minute if there are changes in their mappings.",
			],
			columns: {
				"Node": "The node which will poll the queue",
				"Queue": "The queue to poll",
				"Polling interval": "The polling interval, in milliseconds. Never go below one second. If updated on an active engine, it is applied to the next loop (not the current one).",
				"Max concurrent": "The maximum number of parallel executions the node will allow for this queue (this translates directly as a max number of threads inside the engine).",
			}
		};

		this.refresh();
	}

	newmapping() {
		var t = new this.µQueueMappingDto({
			nodeId: this.nodes[0].id,
			queueId: this.queues[0].id,
			nbThread: 10,
			pollingInterval: 60000,
		});
		this.mappings.push(t);
		this.gridApi.selection.selectRow(t);
		var ctx = this;
		this.$interval(function () {
			ctx.gridApi.cellNav.scrollToFocus(t, ctx.gridOptions.columnDefs[0]);
		}, 0, 1);
	};

	save() {
		// Save and refresh the table - ID may have been
		// generated by the server.
		this.bDbBusy = true;
		this.µQueueMappingDto.saveAll({}, this.mappings, this.refresh.bind(this));
	};

	refresh() {
		this.selected.length = 0;
		this.mappings = this.µQueueMappingDto.query();
		var ctx = this;

		this.µQueueDto.query().$promise.then(function (data) {
			ctx.queues.length = 0;
			Array.prototype.push.apply(ctx.queues, data);
		});
		this.µNodeDto.query().$promise.then(function (data) {
			ctx.nodes.length = 0;
			Array.prototype.push.apply(ctx.nodes, data);
		});

		ctx.bDbBusy = false;
	};

	remove() {
		var q = null;
		for (var i = 0; i < this.selected.length; i++) {
			q = this.selected[i];
			if (q.id !== null && q.id !== undefined) {
				q.$remove({
					id: q.id
				});
			}
			this.mappings.splice(this.mappings.indexOf(q), 1);
		}
		this.selected.length = 0;
	};
}
QueueMappingListCtrl.$inject = ['µQueueMappingDto', 'µQueueDto', 'µNodeDto', 'jqmCellTemplateBoolean', 'jqmCellEditorTemplateBoolean', '$interval'];


export const mappingListComponent = {
	controller: QueueMappingListCtrl,
	template: template,
	bindings: {}
};