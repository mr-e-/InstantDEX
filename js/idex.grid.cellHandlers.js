


var IDEX = (function(IDEX, $, undefined) 
{
	

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
	
	function removeOrderbook(cell)
	{
		var $cell = cell.cellDOM;

		var $orderbook = $cell.find(".orderbook-wrap");
		IDEX.removeOrderbook($orderbook)
	}
	
	
	function saveOrderbook(cell)
	{
		
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
		
		if (localStorage.grids)
		{
			var saveObj = JSON.parse(localStorage.getItem('grids'));
			
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
		}
		else
		{
			var grid = new Sleuthgrids.Grid();
			grid.gridTab.gridTabDOM.trigger("click");
		}
		
		//Sleuthgrids.resizeAllGrids();

	})
	
	
	return IDEX;
	
	
}(IDEX || {}, jQuery));


