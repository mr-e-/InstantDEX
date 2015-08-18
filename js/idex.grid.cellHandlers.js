


var IDEX = (function(IDEX, $, undefined) 
{
	
	var defaultSave = {"windowHeight":594,"windowWidth":1840,"gridSaves":[{"tileSaves":[{"positions":{"height":296.9375,"width":949.234375,"top":0,"bottom":296.9375,"left":0,"right":949.234375},"winPositions":{"height":296.9375,"width":949.234375,"top":38,"bottom":334.9375,"left":0,"right":949.234375},"index":0,"isTileHeaderTabbed":false,"cellSaves":[{"isActive":true,"linkIndex":-1,"cellType":"chart","cellTypeSettings":{"marketSettings":{"baseID":"btc","relID":"nxt","baseName":"btc","relName":"nxt","pair":"btc_nxt","pairName":"btc_nxt","barType":"tick","barWidth":"25","exchange":"poloniex","isVirtual":false,"isFlipped":false}}}]},{"positions":{"height":272.96875,"width":531.640625,"top":0,"bottom":272.96875,"left":949.234375,"right":1480.875},"winPositions":{"height":272.96875,"width":531.640625,"top":38,"bottom":310.96875,"left":949.234375,"right":1480.875},"index":1,"isTileHeaderTabbed":false,"cellSaves":[{"isActive":true,"linkIndex":-1,"cellType":"orderbook"}]},{"positions":{"height":320.96875,"width":531.640625,"top":272.96875,"bottom":593.9375,"left":949.234375,"right":1480.875},"winPositions":{"height":320.96875,"width":531.640625,"top":310.96875,"bottom":631.9375,"left":949.234375,"right":1480.875},"index":2,"isTileHeaderTabbed":false,"cellSaves":[{"isActive":true,"linkIndex":-1,"cellType":"orderbook"}]},{"positions":{"height":593.96875,"width":359.046875,"top":0,"bottom":593.96875,"left":1480.90625,"right":1839.953125},"winPositions":{"height":593.96875,"width":359.046875,"top":38,"bottom":631.96875,"left":1480.90625,"right":1839.953125},"index":3,"isTileHeaderTabbed":false,"cellSaves":[{"isActive":true,"linkIndex":-1,"cellType":"watchlist"}]},{"positions":{"height":296.9375,"width":949.234375,"top":296.9375,"bottom":593.875,"left":0,"right":949.234375},"winPositions":{"height":296.9375,"width":949.234375,"top":334.9375,"bottom":631.875,"left":0,"right":949.234375},"index":4,"isTileHeaderTabbed":false,"cellSaves":[{"isActive":true,"linkIndex":-1,"cellType":"chart","cellTypeSettings":{"marketSettings":{"baseID":"6932037131189568014_NXT","relID":"5527630","baseName":"jl777hodl","relName":"NXT","pair":"6932037131189568014_NXT","pairName":"jl777hodl_NXT","barType":"tick","barWidth":"25","exchange":"nxtae","isVirtual":false,"isFlipped":false}}}]}],"index":0,"isActive":true}]}

	cellHandlers = 
	{
		chart:
		{
			new: newChart,
			loadCustom: loadCustomChart,
			changeMarket: changeChartMarket,
			update: updateChart,
			resize: resizeChart,
			remove: removeChart,
			save: saveChart,
		},
		
		orderbook:
		{
			new: newOrderbook,
			loadCustom: loadCustomOrderbook,
			changeMarket: changeOrderbookMarket,
			remove: removeOrderbook,
			save: saveOrderbook,
		},
		
		watchlist:
		{
			new: newWatchlist,
			loadCustom: loadCustomWatchlist,
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
		
		IDEX.makeChart(chartSettings);
		
		//console.log(settings);
		IDEX.changeChartMarketDOM(chartSettings.marketSettings, $cell);
		
		
	}
	
	
	function changeChartMarket(cell, market)
	{
		var $cell = cell.cellDOM;
		var $svgEl = $cell.find(".chart-wrap svg");
		var chart = $svgEl.sleuthcharts();
		
		if (!chart)
			return
		
		var marketHandler = chart.marketHandler;

				//console.log(IDEX.autoSearchSkynet);
		
		var base = market.base;
		var rel = market.rel;
		
		var basePair = base.isAsset ? base.assetID : base.name;
		var relPair = rel.isAsset ? rel.assetID : rel.name;
		var pair = (basePair + "_" + relPair).toLowerCase();
		var exchange = false;
		
		for (var i = 0; i < IDEX.autoSearchSkynet.length; i++)
		{
			var skynetMarket = IDEX.autoSearchSkynet[i].vals;
			
			if (skynetMarket.pair == pair || skynetMarket.idPair == pair)
			{
				exchange = skynetMarket.exchange;
				break;
			}
		}
		
		
		if (exchange)
		{
			var searchPair = skynetMarket.pair;
			
			if (skynetMarket.idPair.split("_").length == 2 && skynetMarket.exchange == "nxtae")
				searchPair = skynetMarket.idPair
			
			var both = searchPair.split("_")

			var newMarket = {};
			newMarket.baseID =  both[0];
			newMarket.relID = both[1];
			newMarket.baseName = base.name;
			newMarket.relName = rel.name;
			newMarket.exchange = exchange;
			
			console.log(newMarket);
			marketHandler.changeMarket(newMarket);
			IDEX.changeChartMarketDOM(marketHandler.marketSettings, $cell);

			chart.updateChart();
		

		}
		//IDEX.makeChart(chartSettings)
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
	
	function changeOrderbookMarket(cell, market)
	{
		var $cell = cell.cellDOM;
		var $orderbook = $cell.find(".orderbook-wrap");
		var orderbook = IDEX.getObjectByElement($orderbook, IDEX.allOrderbooks, "orderbookDom");

		orderbook.changeMarket(market);
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
		var $watchlist = $cell.find(".watchlist-wrap");
		
		IDEX.newWatchlist($watchlist);
	}
	
	
	function loadCustomWatchlist(cell)
	{
		var $cell = cell.cellDOM;
		var $watchlist = $cell.find(".watchlist-wrap");
		
		IDEX.newWatchlist($watchlist);
	}
	
	
	
	function saveWatchlist(cell)
	{
		
	}
	
	
	
	IDEX.initGrids = function()
	{
		Sleuthgrids.cellHandlers = cellHandlers;
		
		if (!localStorage.grids)
		{
			var saveObj = defaultSave;
		}
		else
		{
			var saveObj = JSON.parse(localStorage.getItem('grids'));
			
			if (!saveObj.gridSaves.length)
				saveObj = defaultSave;
		}
			
		var prevHeight = saveObj.windowHeight;
		var prevWidth = saveObj.windowWidth;
		var gridSaves = saveObj.gridSaves;
		
		
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
				grid.gridTab.gridTabDOM.trigger("click");
				//grid.showGrid();
			}
		}

		
		Sleuthgrids.resizeAllGrids();
	}

	
	
	return IDEX;
	
	
}(IDEX || {}, jQuery));


