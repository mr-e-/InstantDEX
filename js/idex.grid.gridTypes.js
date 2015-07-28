

var IDEX = (function(IDEX, $, undefined) 
{
	
	var $mainGrid = $("#main_grid");
	var $tileAdd = $("#tile_add");
	var $contentWrap = $("#content_wrap");
	var gridCount = 0;

	
	IDEX.makeGridType = function($grid)
	{
		//if (!isTriggeredNew)
		//	return;
		
		var gridType = $grid.attr("data-grid")
		
		if (gridType == "chart")
		{

			
			if (!IDEX.isTriggeredNew)
			{
				var $svgEl = $grid.find(".chart-wrap svg")
				var chart = $svgEl.sleuthcharts();
				
				//console.log(chart)
			}
			else
			{
				var svg = IDEX.makeSVG()
				var $svgEl = $(svg.node())

				$grid.find(".chart-wrap").append($svgEl)
				
				var $dropdownTable = $($("#chartTableTemplate").html())
				$grid.find(".dropdown-wrap").append($dropdownTable)
		
				var $search = $grid.find('.skynet-search');
				IDEX.initSkyNETAuto($search)
				
				IDEX.makeChart({"node":$svgEl})
				
			}
		}
		else if (gridType == "orderbook")
		{
			var $orderbook = $grid.find(".orderbook-wrap");
			IDEX.newOrderbook($orderbook);

		}
		else if (gridType == "watchlist")
		{
			IDEX.initFavorites($grid);
		}
		
		if (IDEX.isTriggeredNew)
			gridCount++;
		
	}

	
	
	IDEX.closeGridType = function($grid)
	{
		var gridType = $grid.attr("data-grid")
		
		if (gridType == "chart")
		{
			
		}
		else if (gridType == "orderbook")
		{
			//console.log(IDEX.allOrderbooks);
			var $orderbook = $grid.find(".orderbook-wrap");
			IDEX.removeOrderbook($orderbook)
		}
		else if (gridType == "watchlist")
		{

		}
	}
	
	
	
	
	return IDEX;
		

}(IDEX || {}, jQuery));
