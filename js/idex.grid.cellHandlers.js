


var IDEX = (function(IDEX, $, undefined) 
{
	

	var cellHandlers = 
	{
		chart:
		{
			new: newChart,
			update: updateChart,
			resize: resizeChart,
			remove: removeChart
		},
		
		orderbook:
		{
			new: newOrderbook,
			remove: removeOrderbook
		},
		
		watchlist:
		{
			new: newWatchlist,
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
	
	
	function updateChart(cell)
	{
		//var $svgEl = $grid.find(".chart-wrap svg");
		//var chart = $svgEl.sleuthcharts();
	}
	
	function resizeChart(cell)
	{
		var $svgEl = cell.cellDOM.find(".chart-wrap svg");
		var chart = $svgEl.sleuthcharts();
		
		
		var $chartNode = chart.node;
		var isVisible = $chartNode.is(":visible")

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
	
	
	function newWatchlist(cell)
	{
		var $cell = cell.cellDOM;

		IDEX.initFavorites($cell);
	}
	
	
	
	$(window).load(function()
	{
		Sleuthgrids.cellHandlers = cellHandlers;
		
		var grid = new Sleuthgrids.Grid();
		
	})
	
	
	return IDEX;
	
	
}(IDEX || {}, jQuery));


