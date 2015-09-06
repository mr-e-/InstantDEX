

var IDEX = (function(IDEX, $, undefined) 
{
	
	var $contentWrap = $("#content_wrap");
	IDEX.allCMarketHistory = [];
	
	
	
	IDEX.MarketHistoryMarket = function(market) 
	{	
		var marketHistoryMarket = this;
		marketHistoryMarket.market = market;
		
		marketHistoryMarket.lastUpdated = -1;
		marketHistoryMarket.isUpdating = false;
		marketHistoryMarket.xhr = false;
		marketHistoryMarket.postDFD = false;
		
		marketHistoryMarket.marketHistory = [];
	};
	
	
	IDEX.MarketHistoryMarket.prototype.update = function(forceUpdate)
	{
		var marketHistoryMarket = this;
		marketHistoryMarket.postDFD = new $.Deferred();
		var market = marketHistoryMarket.market;
		var time = new Date().getTime();
		var lastUpdatedTime = marketHistoryMarket.lastUpdated;
		var dfds = [];

		
		forceUpdate = typeof forceUpdate == "undefined" ? false : forceUpdate;
		
		if (!forceUpdate && ((time - lastUpdatedTime < 10000) && (lastUpdatedTime != -1)))
		{
			//marketHistoryMarket.postDFD.resolve();
		}
		else
		{
			var marketExchanges = market.exchanges;
			marketHistoryMarket.isUpdating = true;

			for (var i = 0; i < marketExchanges.length; i++)
			{
				var exchange = marketExchanges[i];
				var dfd = new $.Deferred();
				dfds.push(dfd);
				
				(function(exchange, dfd)
				{
					var exchangeHandler = IDEX.allExchanges[exchange];
					exchangeHandler = exchange == "InstantDEX" ? IDEX.allExchanges["nxtae"] : exchangeHandler;

					var marketHistoryHandler = exchangeHandler.marketTrades;

					marketHistoryHandler.getMarketTrades(market).done(function(trades)
					{					
						dfd.resolve();
					})
				})(exchange, dfd)
			}
		}
		
		
		if (!dfds.length)
		{
			dfds.push(new $.Deferred());
			dfds[0].resolve();
		}
		
		$.when.apply($, dfds).done(function(data)
		{
			marketHistoryMarket.marketHistory = [];

			for (var i = 0; i < marketExchanges.length; i++)
			{
				var exchange = marketExchanges[i];
				var exchangeHandler = IDEX.allExchanges[exchange];
				exchangeHandler = exchange == "InstantDEX" ? IDEX.allExchanges["nxtae"] : exchangeHandler;
				var marketHistoryHandler = exchangeHandler.marketTrades;
				var exchangeMarketHistory = marketHistoryHandler.markets[market.pairID].trades.slice();
				marketHistoryMarket.marketHistory = marketHistoryMarket.marketHistory.concat(exchangeMarketHistory);
			}
			
			marketHistoryMarket.marketHistory.sort(IDEX.compareProp('timestamp')).reverse();
	
			marketHistoryMarket.isUpdating = false;
			marketHistoryMarket.postDFD.resolve();
		})
		
		
		marketHistoryMarket.lastUpdated = time;
		
		return marketHistoryMarket.postDFD.promise();
	}
	

	
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
			cMarketHistory.refreshDom = $el.find(".refresh-wrap img");
			cMarketHistory.tableDom = cMarketHistory.cMarketHistoryDom.find(".cm-marketHistory-table");
			cMarketHistory.tableDom.parent().perfectScrollbar();

			cMarketHistory.refreshDom.on("click", function(){ cMarketHistory.refreshClick() });
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
	
	IDEX.CMarketHistory.prototype.refreshClick = function()
	{
		var cMarketHistory = this;
		cMarketHistory.updateMarketHistory();
	}

	
	
	IDEX.CMarketHistory.prototype.updateMarketHistory = function()
	{
		var cMarketHistory = this;
		
		if (cMarketHistory.hasMarket)
		{
			var market = cMarketHistory.market;
			var marketExchanges = market.exchanges;
			
			cMarketHistory.tableDom.find("tbody").empty();
			var marketHistoryMarket = new IDEX.MarketHistoryMarket(market);
			marketHistoryMarket.update().done(function()
			{
				var trades = marketHistoryMarket.marketHistory;
				
				for (var j = 0; j < trades.length; j++)
				{
					var trade = trades[j];
					cMarketHistory.addTableRow(trade);
				}
			})
		}
	}
	
	


	IDEX.CMarketHistory.prototype.addTableRow = function(trade)
	{
		var cMarketHistory = this;
		var time = trade.timestamp;
		var price = trade.price;
		var amount = trade.amount;
		var exchange = trade.exchange;;
		var tradeType = trade.tradeType;
		
		
		var tradeClass = "cm-orderType-" + tradeType;
		
		var tr = "<tr><td>"+String(time)+"</td><td>"+String(price)+"</td><td>"+String(amount)+"</td><td>"+String(exchange)+"</td></tr>";
		
		var $tr = $(tr);
		$tr.find("td").eq(1).addClass(tradeClass);
		
		cMarketHistory.tableDom.find("tbody").append($tr);

	}
	
	
	
	
	
	
	
	return IDEX;
	
	
}(IDEX || {}, jQuery));
