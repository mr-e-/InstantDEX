

var IDEX = (function(IDEX, $, undefined) 
{	


	$(".idex-view-trig").on("click", function()
	{
		IDEX.toggleMode();
	})
	
	IDEX.toggleMode = function()
	{
		if (IDEX.isAdvanced)
		{
			$(".mainHeader-grid-icons").removeClass("active");
			$(".idex-advanced-wrap").removeClass("active");
			$(".idex-basic-wrap").addClass("active");
		}
		else
		{
			
			$(".mainHeader-grid-icons").addClass("active");
			$(".idex-advanced-wrap").addClass("active");
			$(".idex-basic-wrap").removeClass("active");
			Sleuthgrids.gridOverlord.resizeAllGrids();
		}
		
		IDEX.isAdvanced = !IDEX.isAdvanced;
	}
	

	IDEX.BasicModeHandler = function()
	{
		var basicModeHandler = this;
		basicModeHandler.exchange = "nxtae";
		basicModeHandler.market = {};
		basicModeHandler.initDOM();
		basicModeHandler.initEventListeners();
		
		basicModeHandler.chart = {};
	};
	
	
	
	IDEX.BasicModeHandler.prototype.init = function()
	{
		var basicModeHandler = this;
		var market = IDEX.defaultMarket;
		var exchange = market.exchanges[0];

		var orderbox = IDEX.newBasicOrderbox(basicModeHandler.orderboxesDOM)
		var chart = basicModeHandler.initChart();
		
		basicModeHandler.orderbox = orderbox;
		basicModeHandler.chart = chart;
		basicModeHandler.changeExchange(exchange);
		basicModeHandler.changeMarket(market);
		//basicModeHandler.changeChartMarket(market, exchange);
		console.log(orderbox);

	}


	IDEX.BasicModeHandler.prototype.initDOM = function()
	{
		var basicModeHandler = this;
		
		basicModeHandler.exchangeListDOM = $(".idex-basic-exchanges");
		basicModeHandler.allMarketsTableDOM = $(".idex-basic-allMarkets table");
		basicModeHandler.allMarketsTableBodyDOM = basicModeHandler.allMarketsTableDOM.find("tbody");
		basicModeHandler.marketListDOM = $(".idex-basic-marketBox");
		basicModeHandler.marketNameDOM = $(".idex-basic-marketName span");
		basicModeHandler.orderboxesDOM = $(".idex-basic-orderboxes");

	}
	
	
	IDEX.BasicModeHandler.prototype.initEventListeners = function()
	{
		var basicModeHandler = this;
		
		basicModeHandler.exchangeListDOM.on("click", "li", function()
		{
			var exchange = $(this).attr("data-val");
			
			basicModeHandler.changeExchange(exchange);
		})
		
		basicModeHandler.marketListDOM.on("click", "tr", function()
		{
			var market = $(this).data("market");
			
			basicModeHandler.changeMarket(market);
		})
		
	}
	

	
	
	IDEX.BasicModeHandler.prototype.changeExchange = function(exchange)
	{
		var basicModeHandler = this;
		
		basicModeHandler.exchange = exchange;
		basicModeHandler.updateMarketList();
	}
	
	
	IDEX.BasicModeHandler.prototype.changeMarket = function(market)
	{
		var basicModeHandler = this;
		var exchange = basicModeHandler.exchange;
		basicModeHandler.market = market;
		
		basicModeHandler.marketNameDOM.text(market.marketName);
		basicModeHandler.changeChartMarket(market, exchange);
		basicModeHandler.orderbox.buyBox.exchange = exchange;
		basicModeHandler.orderbox.sellBox.exchange = exchange;
		basicModeHandler.orderbox.changeMarket(market);

	}
	
	
	IDEX.BasicModeHandler.prototype.updateMarketList = function()
	{
		var basicModeHandler = this;
		var exchange = basicModeHandler.exchange;
		var $tbody = basicModeHandler.allMarketsTableBodyDOM;
		var markets = IDEX.allExchanges[exchange].markets;
		
		for (var i = 0; i < markets.length; i++)
		{
			var market = markets[i];
			var marketName = market.marketName;
			
			var tr = "<tr><td>"+marketName+"</td></tr>"
			var $tr = $(tr);
			$tr.data("market", market);
			$tbody.append($tr);
		}
	}
	
	IDEX.BasicModeHandler.prototype.updateFavMarketList = function()
	{
		var basicModeHandler = this;
		var exchange = basicModeHandler.exchange;
		var $tbody = basicModeHandler.allMarketsTableBodyDOM;
		var markets = IDEX.allExchanges[exchange].markets;

		var $tbody = $(".idex-classic-favs table tbody");
		var markets = IDEX.watchlistOverlord.watchlistMarkets;
		for (var i = 0; i < markets.length; i++)
		{
			var market = markets[i];
			var marketName = market.marketName;
			
			var tr = "<tr><td>"+marketName+"</td></tr>"
			var $tr = $(tr);
			$tr.data("market", market);
			$tbody.append($tr);
		}
	}
	

	IDEX.BasicModeHandler.prototype.initChart = function()
	{
		var basicModeHandler = this;
		var $chartWrap = $(".idex-basic-chart-wrap");
		
		var $chartTemplate = $($("#chart_template").html());
		$chartWrap.append($chartTemplate);

		
		var $dropdownTable = $($("#chartTableTemplate").html());
		$chartWrap.find(".dropdown-wrap").append($dropdownTable);

		var $search = $(".idex-basic-chart-wrap").find('.skynet-search');
		IDEX.initSkyNETAuto($search);
		
		var chartSettings = {};
		chartSettings.node = $chartWrap.find(".chart-wrap");

		var chart = IDEX.makeChart(chartSettings, basicModeHandler);
		
		return chart;
	}
	
	
	IDEX.BasicModeHandler.prototype.changeChartMarket = function(market, exchange)
	{
		var basicModeHandler = this;
		var chart = basicModeHandler.chart;
		
		IDEX.changeChartMarket(chart, market, exchange);
	}
	
	
	IDEX.BasicModeHandler.prototype.changeOrderbookMarket = function(market, exchange)
	{
		var basicModeHandler = this;
		var chart = basicModeHandler.chart;
		
		IDEX.changeChartMarket(chart, market, exchange);
	}
	
	

	return IDEX;
	
}(IDEX || {}, jQuery));
