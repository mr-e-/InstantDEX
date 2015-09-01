

var IDEX = (function(IDEX, $, undefined) 
{
	
	var $contentWrap = $("#content_wrap");
	IDEX.allCMarketHistory = [];
	
	
	IDEX.CMarketHistory = function(obj) 
	{	
		this.hasMarket = false;
		
		this.cMarketHistoryDom;
		this.searchInputDom;
		this.tableDom;
		this.cellHandler;

		IDEX.constructFromObject(this, obj);
	};
	

	
	IDEX.newCMarketHistory = function($el, cellHandler)
	{
		var cMarketHistory = IDEX.getObjectByElement($el, IDEX.allCMarketHistory, "cMarketHistoryDom");

		if (!cMarketHistory)
		{
			cMarketHistory = new IDEX.CMarketHistory();
			cMarketHistory.cellHandler = cellHandler;

			cMarketHistory.cMarketHistoryDom = $el;
			cMarketHistory.searchInputDom = $el.find(".cm-marketHistory-search-wrap input");
			cMarketHistory.tableDom = cMarketHistory.cMarketHistoryDom.find(".cm-marketHistory-table");
			cMarketHistory.tableDom.parent().perfectScrollbar();
			
			IDEX.allCMarketHistory.push(cMarketHistory);
		}
		

				
		return cMarketHistory;
	};
	
	
	
	IDEX.CMarketHistory.prototype.changeMarket = function(market)
	{
		var cMarketHistory = this;
		
		cMarketHistory.hasMarket = true;
		cMarketHistory.market = market;
		
		cMarketHistory.updateMarketDOM();
		cMarketHistory.updateMarketHistory();

	}
	
	
	IDEX.CMarketHistory.prototype.updateMarketDOM = function()
	{
		var cMarketHistory = this;
		cMarketHistory.searchInputDom.val(cMarketHistory.market.marketName);

	}
	
	
	$contentWrap.on("click", ".cm-marketHistory-search-popup-trig", function()
	{
		var $el = $(this).closest(".cm-marketHistory-wrap");
		var cMarketHistory = IDEX.getObjectByElement($el, IDEX.allCMarketHistory, "cMarketHistoryDom");

		cMarketHistory.updateMarketHistory();
	})
	
	
	
	IDEX.CMarketHistory.prototype.updateMarketHistory = function()
	{
		var cMarketHistory = this;
		
		if (cMarketHistory.hasMarket)
		{
			var market = cMarketHistory.market;
			var marketExchanges = market.exchanges;
			
			cMarketHistory.tableDom.find("tbody").empty();
			
			for (var i = 0; i < marketExchanges.length; i++)
			{
				var exchange = marketExchanges[i];
				
				if (exchange == "InstantDEX" || exchange == "nxtae")
				{
					var exchangeHandler = IDEX.allExchanges[exchange];
					exchangeHandler = exchange == "InstantDEX" ? IDEX.allExchanges["nxtae"] : exchangeHandler;

					var marketHistoryHandler = exchangeHandler.marketTrades;

					marketHistoryHandler.getMarketTrades(market).done(function(trades)
					{						
						console.log(trades);
						
						for (var j = 0; j < trades.length; j++)
						{
							var trade = trades[j];
							cMarketHistory.addTableRow(trade, exchange);
						}
					})
				}
				else
				{
					continue;
					
					var exchangeHandler = IDEX.allExchanges[exchange];
					var tradeHistoryHandler = exchangeHandler.accountTrades;
					
					tradeHistoryHandler.updateTrades().done(function()
					{
			
					})
				}
			}
		}
	}
	
	


	IDEX.CMarketHistory.prototype.addTableRow = function(trade, exchange)
	{
		var cMarketHistory = this;
		var time = trade.timestamp;
		var price = trade.price;
		var amount = trade.amount;
		var exchange = exchange;
		var tradeType = trade.tradeType;
		
		
		var tradeClass = "cm-orderType-" + tradeType;
		
		var tr = "<tr><td>"+time+"</td><td>"+String(price)+"</td><td>"+String(amount)+"</td><td>"+String(exchange)+"</td></tr>";
		
		var $tr = $(tr);
		$tr.find("td").eq(1).addClass(tradeClass);
		
		cMarketHistory.tableDom.find("tbody").append($tr);

	}
	
	
	
	
	
	
	
	return IDEX;
	
	
}(IDEX || {}, jQuery));
