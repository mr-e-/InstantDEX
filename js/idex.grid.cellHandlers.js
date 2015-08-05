


var IDEX = (function(IDEX, $, undefined) 
{
	
	var defaultSave = {"windowHeight":716,"windowWidth":1855,"gridSaves":[{"tileSaves":[{"positions":{"height":517.46875,"width":957,"top":0,"bottom":517.46875,"left":0,"right":957},"winPositions":{"height":517.46875,"width":957,"top":38,"bottom":555.46875,"left":0,"right":957},"index":0,"isTileHeaderTabbed":false,"cellSaves":[{"isActive":true,"linkIndex":-1,"cellType":"chart","cellTypeSettings":{"marketSettings":{"baseID":"btc","relID":"nxt","baseName":"btc","relName":"nxt","pair":"btc_nxt","pairName":"btc_nxt","barType":"tick","barWidth":"25","exchange":"poloniex","isVirtual":false,"isFlipped":false}}}]},{"positions":{"height":366.109375,"width":536,"top":0,"bottom":366.109375,"left":957,"right":1493},"winPositions":{"height":366.109375,"width":536,"top":38,"bottom":404.109375,"left":957,"right":1493},"index":1,"isTileHeaderTabbed":false,"cellSaves":[{"isActive":true,"linkIndex":-1,"cellType":"orderbook"}]},{"positions":{"height":198.46875,"width":957,"top":517.46875,"bottom":715.9375,"left":0,"right":957},"winPositions":{"height":198.46875,"width":957,"top":555.46875,"bottom":753.9375,"left":0,"right":957},"index":2,"isTileHeaderTabbed":true,"cellSaves":[{"isActive":false,"linkIndex":-1,"cellType":"orders","cellTypeSettings":{}},{"isActive":true,"linkIndex":-1,"cellType":"balances","cellTypeSettings":{}}]},{"positions":{"height":349.859375,"width":536,"top":366.109375,"bottom":715.96875,"left":957,"right":1493},"winPositions":{"height":349.859375,"width":536,"top":404.109375,"bottom":753.96875,"left":957,"right":1493},"index":3,"isTileHeaderTabbed":false,"cellSaves":[{"isActive":true,"linkIndex":-1,"cellType":"orderbook"}]},{"positions":{"height":453,"width":362,"top":0,"bottom":453,"left":1493,"right":1855},"winPositions":{"height":453,"width":362,"top":38,"bottom":491,"left":1493,"right":1855},"index":4,"isTileHeaderTabbed":false,"cellSaves":[{"isActive":true,"linkIndex":-1,"cellType":"watchlist"}]},{"positions":{"height":262.984375,"width":362,"top":453,"bottom":715.984375,"left":1493,"right":1855},"winPositions":{"height":262.984375,"width":362,"top":491,"bottom":753.984375,"left":1493,"right":1855},"index":5,"isTileHeaderTabbed":true,"cellSaves":[{"isActive":false,"linkIndex":-1,"cellType":"info","cellTypeSettings":{}},{"isActive":true,"linkIndex":-1,"cellType":"trades","cellTypeSettings":{}}]}],"index":0,"isActive":true}]}
	

	cellHandlers = 
	{
		chart:
		{
			new: newChart,
			loadCustom: loadCustomChart,
			update: updateChart,
			resize: resizeChart,
			remove: removeChart,
			save: saveChart,
		},
		
		orderbook:
		{
			new: newOrderbook,
			loadCustom: loadCustomOrderbook,
			remove: removeOrderbook,
			save: saveOrderbook,
		},
		
		watchlist:
		{
			new: newWatchlist,
			save: saveWatchlist,
		}
	};
	
	
	
	function newChart(cell)
	{
		var $cell = cell.cellDOM;
		var svg = IDEX.makeSVG()
		var $svgEl = $(svg.node())

		$cell.find(".chart-wrap").append($svgEl)
		
		var $dropdownTable = $($("#chartTableTemplate").html())
		$cell.find(".dropdown-wrap").append($dropdownTable)

		var $search = $cell.find('.skynet-search');
		IDEX.initSkyNETAuto($search)
		
		IDEX.makeChart({"node":$svgEl})
	}
	
	
	function loadCustomChart(cell, settings)
	{
		var $cell = cell.cellDOM;
		var svg = IDEX.makeSVG()
		var $svgEl = $(svg.node())

		$cell.find(".chart-wrap").append($svgEl)
		
		var $dropdownTable = $($("#chartTableTemplate").html())
		$cell.find(".dropdown-wrap").append($dropdownTable)

		var $search = $cell.find('.skynet-search');
		IDEX.initSkyNETAuto($search)
		
		var chartSettings = {};
		chartSettings.node = $svgEl;
		$.extend(chartSettings, settings);
		
		IDEX.makeChart(chartSettings)
	}
	
	
	function updateChart(cell)
	{
		var $svgEl = cell.cellDOM.find(".chart-wrap svg");
		var chart = $svgEl.sleuthcharts();
		
		if (!chart)
			return;
		
		var $chartNode = chart.node;
		var isVisible = $chartNode.is(":visible")
		chart.setContainerSize();

		if (!isVisible)
		{
			//chart.needsResize = true;
		}
		else
		{
			chart.redraw();
		}
	}
	
	function resizeChart(cell)
	{
		var $svgEl = cell.cellDOM.find(".chart-wrap svg");
		var chart = $svgEl.sleuthcharts();
		
		if (!chart)
			return;
		
		var $chartNode = chart.node;
		var isVisible = $chartNode.is(":visible")
		chart.setContainerSize();

		if (!isVisible)
		{
			chart.needsResize = true;
		}
		else
		{
			chart.redraw();
		}
	}
	
	
	function removeChart(cell)
	{
		//var $svgEl = $grid.find(".chart-wrap svg");
		//var chart = $svgEl.sleuthcharts();
	}
	
	function saveChart(cell)
	{
		var $svgEl = cell.cellDOM.find(".chart-wrap svg");
		var chart = $svgEl.sleuthcharts();
		
		var obj = {};
		obj.marketSettings = chart.marketHandler.marketSettings;
		
		//console.log(marketSettings);
		
		return obj;
	}
	
	
	
	function newOrderbook(cell)
	{
		var $cell = cell.cellDOM;
		
		var $orderbook = $cell.find(".orderbook-wrap");
		IDEX.newOrderbook($orderbook);
	}
	
	
	function loadCustomOrderbook(cell, settings)
	{
		var $cell = cell.cellDOM;
		
		var $orderbook = $cell.find(".orderbook-wrap");
		IDEX.newOrderbook($orderbook);
	}

	
	function saveOrderbook(cell)
	{
		
	}
	
	function removeOrderbook(cell)
	{
		var $cell = cell.cellDOM;

		var $orderbook = $cell.find(".orderbook-wrap");
		IDEX.removeOrderbook($orderbook)
	}
	

	
	function newWatchlist(cell)
	{
		var $cell = cell.cellDOM;

		IDEX.initFavorites($cell);
	}
	
	
	
	function saveWatchlist(cell)
	{
		
	}
	
	
	
	$(window).load(function()
	{
		Sleuthgrids.cellHandlers = cellHandlers;
		
		if (!localStorage.grids)
		{
			var saveObj = defaultSave;
		}
		else
		{
			var saveObj = JSON.parse(localStorage.getItem('grids'));	
		}
			
		var prevHeight = saveObj.windowHeight;
		var prevWidth = saveObj.windowWidth;
		var gridSaves = saveObj.gridSaves;
		
		console.log(gridSaves)
		
		for (var i = 0; i < gridSaves.length; i++)
		{
			var gridSave = gridSaves[i];
			var grid = new Sleuthgrids.Grid();
			grid.gridSave = gridSave;
			grid.prevGridHeight = prevHeight;
			grid.prevGridWidth = prevWidth;
			grid.isActive = gridSave.isActive;
					
			grid.initTilesFromSave(gridSave.tileSaves);

					
			if (grid.isActive)
			{
				//console.log(grid)
				grid.gridTab.gridTabDOM.trigger("click");
				//grid.showGrid();
			}
		}
		/*else
		{
			var grid = new Sleuthgrids.Grid();
			grid.gridTab.gridTabDOM.trigger("click");
		}*/
		
		Sleuthgrids.resizeAllGrids();
		

	})
	
	
	return IDEX;
	
	
}(IDEX || {}, jQuery));


