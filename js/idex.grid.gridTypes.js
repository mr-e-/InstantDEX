

var IDEX = (function(IDEX, $, undefined) 
{
	
	
	IDEX.makeGridType = function($grid)
	{
		//if (!isTriggeredNew)
		//	return;
		
		var gridType = $grid.attr("data-grid")
		
		if (gridType == "chart")
		{
			if (!isTriggeredNew)
			{
				var id = $grid.find(".chart-header").attr("data-chart");
				IDEX.makeChartDefault(id);
				return
			}
			
			var svg = IDEX.makeSVG()
			var $svgEl = $(svg.node())
			var id = "chart_" + String(gridCount)
			$svgEl.attr("id", id)
			$grid.find(".chart-wrap").append($svgEl)
			$grid.find(".chart-header").attr("data-chart", id);
			
			var $dropdownTable = $($("#chartTableTemplate").html())
			$grid.find(".dropdown-wrap").append($dropdownTable)
			
			IDEX.makeChartDefault(id);
			
	
			var $search = $grid.find('.skynet-search');
			IDEX.initSkyNETAuto($search)
		}
		else if (gridType == "orderbook")
		{
			for (var i = 0; i < IDEX.user.labels.length; i++)
			{
				var label = IDEX.user.labels[i];
				var name = label.name;
				
				var li = "<li data-val='"+name+"'>"+name+"</li>"
				$grid.find(".orderbook-label-dropdown ul").append($(li))
			}

		}
		else if (gridType == "watchlist")
		{
			IDEX.initFavorites($grid);
		}
		
		if (isTriggeredNew)
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
